(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/utils/contractConfig.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Contract configuration for Andromeda Protocol
__turbopack_context__.s([
    "CONTRACT_ADDRESS",
    ()=>CONTRACT_ADDRESS,
    "IPFS_GATEWAY",
    ()=>IPFS_GATEWAY,
    "NETWORK_CONFIG",
    ()=>NETWORK_CONFIG,
    "RACE_NAMES",
    ()=>RACE_NAMES,
    "RARITY_COLORS",
    ()=>RARITY_COLORS,
    "RARITY_NAMES",
    ()=>RARITY_NAMES,
    "RARITY_VALUES",
    ()=>RARITY_VALUES
]);
const CONTRACT_ADDRESS = "0x317Fbed8fD8491B080f98A8e3540A6cb190908d7";
const NETWORK_CONFIG = {
    chainId: "0xaa36a7",
    chainName: "Sepolia Test Network",
    rpcUrls: [
        "https://rpc.sepolia.org",
        "https://sepolia-rpc.publicnode.com",
        "https://eth-sepolia.g.alchemy.com/v2/demo"
    ],
    blockExplorerUrls: [
        "https://sepolia.etherscan.io"
    ],
    nativeCurrency: {
        name: "SepoliaETH",
        symbol: "ETH",
        decimals: 18
    }
};
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const RARITY_VALUES = {
    0: 100,
    1: 300,
    2: 700,
    3: 1000 // Legendary
};
const RACE_NAMES = {
    0: "Humans",
    1: "Zephyrs",
    2: "Kraths",
    3: "Preservers",
    4: "Synthetics",
    5: "Aquarians",
    6: "Ancients"
};
const RARITY_NAMES = {
    0: "Common",
    1: "Rare",
    2: "Epic",
    3: "Legendary"
};
const RARITY_COLORS = {
    0: "#9CA3AF",
    1: "#3B82F6",
    2: "#8B5CF6",
    3: "#F59E0B" // Gold pour Legendary
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contracts/AndromedaProtocol.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_vrfCoordinator\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_linkToken\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"_keyHash\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"ERC721EnumerableForbiddenBatchMint\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721IncorrectOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721InsufficientApproval\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"approver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidApprover\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOperator\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidReceiver\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"ERC721InvalidSender\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721NonexistentToken\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"ERC721OutOfBoundsIndex\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"OwnableInvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"OwnableUnauthorizedAccount\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"approved\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"name\":\"CardLocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"}],\"name\":\"CardMinted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"CardUnlocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"token1\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"token2\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"initiator\",\"type\":\"address\"}],\"name\":\"CardsExchanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"burnedTokens\",\"type\":\"uint256[]\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"newTokenId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"newRarity\",\"type\":\"uint8\"}],\"name\":\"CardsFused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"LOCK_DURATION\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_CARDS_PER_OWNER\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"TRANSACTION_COOLDOWN\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"VRF_FEE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"}],\"name\":\"canTransact\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"cards\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"ipfsHash\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"createdAt\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lastTransferAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isLocked\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"myTokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"otherOwner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"otherTokenId\",\"type\":\"uint256\"}],\"name\":\"exchange\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[3]\",\"name\":\"tokenIds\",\"type\":\"uint256[3]\"},{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"}],\"name\":\"fuse\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getApproved\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getCard\",\"outputs\":[{\"components\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"ipfsHash\",\"type\":\"string\"},{\"internalType\":\"address[]\",\"name\":\"previousOwners\",\"type\":\"address[]\"},{\"internalType\":\"uint256\",\"name\":\"createdAt\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lastTransferAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isLocked\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"internalType\":\"struct AndromedaProtocol.Card\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"}],\"name\":\"getUserCards\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"isCardLocked\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"lastTransactionTime\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"requestId\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ownerOf\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"pendingMintHashes\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"\",\"type\":\"uint8\"}],\"name\":\"rarityValues\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"requestId\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"randomness\",\"type\":\"uint256\"}],\"name\":\"rawFulfillRandomness\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"randomness\",\"type\":\"uint256\"}],\"name\":\"testMint\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"tokenByIndex\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"tokenOfOwnerByIndex\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"tokenURI\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"vrfRequests\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]"));}),
"[project]/utils/web3Utils.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Récupère tous les tokenIds ERC-721 possédés par une adresse (owner)
 * Utilise balanceOf + tokenOfOwnerByIndex (standard ERC-721 Enumerable)
 * @param {string} owner Adresse du propriétaire
 * @returns {Promise<number[]>} Liste des tokenIds
 */ __turbopack_context__.s([
    "checkAndSwitchNetwork",
    ()=>checkAndSwitchNetwork,
    "connectWallet",
    ()=>connectWallet,
    "formatAddress",
    ()=>formatAddress,
    "formatCooldown",
    ()=>formatCooldown,
    "formatTimestamp",
    ()=>formatTimestamp,
    "getAllTokenIds",
    ()=>getAllTokenIds,
    "getCardDetails",
    ()=>getCardDetails,
    "getContract",
    ()=>getContract,
    "getContractReadOnly",
    ()=>getContractReadOnly,
    "getIPFSUrl",
    ()=>getIPFSUrl,
    "getProvider",
    ()=>getProvider,
    "getRemainingCooldown",
    ()=>getRemainingCooldown,
    "getSigner",
    ()=>getSigner,
    "handleTransactionError",
    ()=>handleTransactionError,
    "isCardLocked",
    ()=>isCardLocked,
    "isMetamaskInstalled",
    ()=>isMetamaskInstalled,
    "setupNetworkListener",
    ()=>setupNetworkListener
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/contractConfig.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/contracts/AndromedaProtocol.json (json)");
const getAllTokenIds = async (owner)=>{
    if (!owner) return [];
    try {
        const contract = await getContractReadOnly();
        const balance = await contract.balanceOf(owner);
        const tokenIds = [];
        for(let i = 0; i < balance; i++){
            // tokenOfOwnerByIndex(address, index) => tokenId
            const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
            tokenIds.push(Number(tokenId));
        }
        return tokenIds;
    } catch (err) {
        console.error('Erreur getAllTokenIds:', err);
        return [];
    }
};
const getCardDetails = async (tokenId)=>{
    if (tokenId === undefined || tokenId === null) return null;
    try {
        const contract = getContractReadOnly();
        const card = await contract.cards(tokenId);
        return {
            tokenId: Number(tokenId),
            name: card.name,
            race: card.race,
            rarity: card.rarity,
            value: card.value,
            ipfsHash: card.ipfsHash,
            previousOwners: card.previousOwners,
            createdAt: Number(card.createdAt),
            lastTransferAt: Number(card.lastTransferAt),
            isLocked: card.isLocked,
            lockUntil: Number(card.lockUntil)
        };
    } catch (err) {
        console.error(`Erreur getCardDetails(${tokenId}):`, err);
        return null;
    }
};
;
;
;
const isMetamaskInstalled = ()=>{
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && typeof window.ethereum !== 'undefined';
};
const connectWallet = async ()=>{
    if (!isMetamaskInstalled()) {
        throw new Error("Metamask n'est pas installé. Veuillez installer Metamask pour continuer.");
    }
    try {
        // Demander l'autorisation de connexion
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        // Vérifier le réseau
        await checkAndSwitchNetwork();
        return accounts[0];
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        throw error;
    }
};
const checkAndSwitchNetwork = async ()=>{
    try {
        if (!isMetamaskInstalled()) {
            throw new Error("Metamask n'est pas installé");
        }
        const chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });
        console.log(`Réseau actuel: ${chainId}`);
        console.log(`Réseau cible: ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId}`);
        if (chainId !== __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId) {
            try {
                console.log(`🔄 Tentative de changement vers ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}...`);
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [
                        {
                            chainId: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId
                        }
                    ]
                });
                console.log(`✅ Réseau changé vers ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}`);
                return true;
            } catch (switchError) {
                // Si le réseau n'existe pas, on l'ajoute
                if (switchError.code === 4902) {
                    console.log(`⚠️ Réseau ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName} non trouvé dans Metamask`);
                    console.log(`📝 Ajout du réseau ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}...`);
                    try {
                        const result = await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId,
                                    chainName: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName,
                                    rpcUrls: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].rpcUrls,
                                    blockExplorerUrls: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].blockExplorerUrls,
                                    nativeCurrency: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].nativeCurrency
                                }
                            ]
                        });
                        console.log(`✅ Réseau ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName} ajouté avec succès`);
                        console.log(`📍 RPC utilisé: ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].rpcUrls[0]}`);
                        return true;
                    } catch (addError) {
                        console.error("❌ Erreur lors de l'ajout du réseau:", {
                            code: addError.code,
                            message: addError.message
                        });
                        if (addError.code === 4001) {
                            throw new Error("Vous avez refusé d'ajouter le réseau Sepolia. L'application ne peut pas fonctionner sans ce réseau.");
                        } else {
                            throw new Error(`❌ Impossible d'ajouter ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}.\n\nVeuillez l'ajouter manuellement dans Metamask:\n- Chain ID: 11155111\n- RPC: ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].rpcUrls[0]}\n- Symbol: ETH\n- Explorer: ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].blockExplorerUrls[0]}`);
                        }
                    }
                } else if (switchError.code === 4001) {
                    // Utilisateur a refusé le changement
                    throw new Error("⚠️ Vous devez accepter le changement vers Sepolia pour continuer.");
                } else {
                    console.error("Erreur lors du changement de réseau:", {
                        code: switchError.code,
                        message: switchError.message
                    });
                    throw new Error(`Erreur lors du changement de réseau: ${switchError.message}`);
                }
            }
        } else {
            console.log(`✅ Déjà connecté à ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}`);
            return true;
        }
    } catch (error) {
        console.error("❌ Erreur complète:", error);
        throw error;
    }
};
const setupNetworkListener = ()=>{
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.ethereum) {
        window.ethereum.on('chainChanged', (chainId)=>{
            console.log(`Réseau changé vers ${chainId}`);
            // Recharger pour s'assurer que tout est à jour
            if (chainId !== __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId) {
                console.warn(`⚠️ Vous êtes passé sur un réseau différent. Redémarrage...`);
            // Optionnel: recharger la page
            // window.location.reload();
            }
        });
        window.ethereum.on('accountsChanged', (accounts)=>{
            if (accounts.length === 0) {
                console.log('Wallet déconnecté');
            } else {
                console.log(`Compte changé: ${accounts[0]}`);
            }
        });
    }
};
const getProvider = ()=>{
    if (!isMetamaskInstalled()) {
        throw new Error("Metamask n'est pas installé");
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].BrowserProvider(window.ethereum);
};
const getSigner = async ()=>{
    const provider = getProvider();
    return await provider.getSigner();
};
const getContract = async ()=>{
    const signer = await getSigner();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Contract(__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["CONTRACT_ADDRESS"], __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__["default"], signer);
};
const getContractReadOnly = ()=>{
    const provider = getProvider();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Contract(__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["CONTRACT_ADDRESS"], __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__["default"], provider);
};
const formatAddress = (address)=>{
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
const formatTimestamp = (timestamp)=>{
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('fr-FR');
};
const getRemainingCooldown = (lastTransactionTime, cooldownDuration = 300)=>{
    const now = Math.floor(Date.now() / 1000);
    const timePassed = now - lastTransactionTime;
    const remaining = cooldownDuration - timePassed;
    if (remaining <= 0) return 0;
    return remaining;
};
const formatCooldown = (seconds)=>{
    if (seconds <= 0) return "Disponible";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
};
const isCardLocked = (lockUntil)=>{
    const now = Math.floor(Date.now() / 1000);
    return lockUntil > now;
};
const getIPFSUrl = (hash)=>{
    if (!hash) return '';
    // Retire le préfixe ipfs:// si présent
    const cleanHash = hash.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};
const handleTransactionError = (error)=>{
    console.error('Transaction error:', error);
    if (error.reason) {
        return `❌ Erreur: ${error.reason}`;
    }
    if (error.message) {
        if (error.message.includes('user rejected')) {
            return '❌ Transaction annulée par l\'utilisateur';
        }
        if (error.message.includes('insufficient funds')) {
            return '❌ Fonds insuffisants pour la transaction';
        }
        if (error.message.includes('Contract execution reverted')) {
            return '❌ Contrat a rejeté la transaction';
        }
        return `❌ Erreur: ${error.message}`;
    }
    return '❌ Une erreur est survenue lors de la transaction';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/WalletConnect.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WalletConnect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function WalletConnect({ onConnect }) {
    _s();
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isDisconnectingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletConnect.useEffect": ()=>{
            setMounted(true);
        }
    }["WalletConnect.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletConnect.useEffect": ()=>{
            if (!mounted) return;
            // Vérifier si déjà connecté au chargement
            checkConnection();
            // Mettre en place les listeners de réseau et compte
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["setupNetworkListener"])();
            // Écouter les changements de compte
            if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.ethereum) {
                window.ethereum.on('accountsChanged', handleAccountsChanged);
            }
            return ({
                "WalletConnect.useEffect": ()=>{
                    if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.ethereum) {
                        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    }
                }
            })["WalletConnect.useEffect"];
        }
    }["WalletConnect.useEffect"], [
        mounted
    ]);
    const checkConnection = async ()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) return;
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            if (accounts.length > 0 && !isDisconnectingRef.current) {
                setAccount(accounts[0]);
                if (onConnect) onConnect(accounts[0]);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de connexion:", error);
        }
    };
    const handleAccountsChanged = (accounts)=>{
        // Ignorer l'événement si l'utilisateur vient de se déconnecter intentionnellement
        if (isDisconnectingRef.current) {
            isDisconnectingRef.current = false;
            return;
        }
        if (accounts.length === 0) {
            // Tous les comptes sont déconnectés
            setAccount(null);
            if (onConnect) onConnect(null);
            setShowMenu(false);
            setError('');
        } else if (account && accounts[0] !== account) {
            // Le compte a CHANGÉ - déconnexion automatique nécessaire
            console.log(`Account changed from ${account} to ${accounts[0]} - Auto disconnecting`);
            // Montrer notification
            setError('Compte Metamask changé. Veuillez vous reconnecter.');
            // Déconnexion propre
            setTimeout(()=>{
                setAccount(null);
                if (onConnect) onConnect(null);
                setShowMenu(false);
                setError('');
            }, 2000);
        } else {
            // Même compte reste connecté (reconnexion ou app remontée)
            setAccount(accounts[0]);
            if (onConnect) onConnect(accounts[0]);
            setShowMenu(false);
        }
    };
    const handleConnect = async ()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) {
            setError("Metamask n'est pas installé. Installez-le sur metamask.io");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const connectedAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["connectWallet"])();
            setAccount(connectedAccount);
            if (onConnect) onConnect(connectedAccount);
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError(error.message || "Erreur lors de la connexion");
        } finally{
            setLoading(false);
        }
    };
    const handleDisconnect = ()=>{
        isDisconnectingRef.current = true;
        setAccount(null);
        if (onConnect) onConnect(null);
        setShowMenu(false);
        setError('');
    };
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "wallet-connect",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "btn btn-connect",
                disabled: true,
                children: "Chargement..."
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 118,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 117,
            columnNumber: 7
        }, this);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "wallet-connect",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-warning",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        children: "⚠️ Metamask requis"
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Vous devez installer Metamask pour utiliser cette application."
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "https://metamask.io/download/",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "btn btn-primary",
                        children: "Installer Metamask"
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 128,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 127,
            columnNumber: 7
        }, this);
    }
    if (account) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "wallet-connected",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "account-info",
                    onClick: ()=>setShowMenu(!showMenu),
                    style: {
                        cursor: 'pointer',
                        position: 'relative'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "status-indicator connected"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 152,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "account-address",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatAddress"])(account)
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginLeft: '8px',
                                fontSize: '0.8rem'
                            },
                            children: "▼"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WalletConnect.js",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                showMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "wallet-menu",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-header",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)'
                                },
                                children: "Compte connecté"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.js",
                                lineNumber: 160,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-account",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "status-indicator connected",
                                    style: {
                                        marginRight: '8px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/WalletConnect.js",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                wordBreak: 'break-all'
                                            },
                                            children: account
                                        }, void 0, false, {
                                            fileName: "[project]/components/WalletConnect.js",
                                            lineNumber: 165,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: 'var(--success)',
                                                marginTop: '4px'
                                            },
                                            children: "✓ Connecté"
                                        }, void 0, false, {
                                            fileName: "[project]/components/WalletConnect.js",
                                            lineNumber: 168,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/WalletConnect.js",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 162,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-divider"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 173,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: `https://sepolia.etherscan.io/address/${account}`,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "wallet-menu-item",
                            style: {
                                textDecoration: 'none',
                                color: 'var(--primary)'
                            },
                            children: "🔗 Voir sur Etherscan"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 174,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-divider"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 183,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleDisconnect,
                            className: "wallet-menu-item",
                            style: {
                                color: 'var(--error)'
                            },
                            children: "🚪 Déconnecter"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 184,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WalletConnect.js",
                    lineNumber: 158,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 146,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "wallet-connect",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleConnect,
                disabled: loading,
                className: "btn btn-connect",
                children: loading ? 'Connexion...' : '🦊 Connecter Metamask'
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 199,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 207,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/WalletConnect.js",
        lineNumber: 198,
        columnNumber: 5
    }, this);
}
_s(WalletConnect, "Rbaz7u5+Ssa1ttvDu7TKIdBelHs=");
_c = WalletConnect;
var _c;
__turbopack_context__.k.register(_c, "WalletConnect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/ipfs-hashes.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"humans":{"common":{"imageHash":"QmYDMUnwA22TPrdEnvDjKYGFwAXUe5X8U4wXW4jPUVwj3b","metadataHash":"QmP5zLW2PNdAAYa3EDMzjE9peCKQiw43uXjKtCFc4cjRYK","imageUrl":"ipfs://QmYDMUnwA22TPrdEnvDjKYGFwAXUe5X8U4wXW4jPUVwj3b","metadataUrl":"ipfs://QmP5zLW2PNdAAYa3EDMzjE9peCKQiw43uXjKtCFc4cjRYK"},"rare":{"imageHash":"QmXPA1KVWbpDRevkegSQbVPNkbUyuxmpgmnJ3VthYKaM9T","metadataHash":"QmTcQzQAMKUmBaGWAj7ncKHHiXLwMNevc7SdahF6AaQtKc","imageUrl":"ipfs://QmXPA1KVWbpDRevkegSQbVPNkbUyuxmpgmnJ3VthYKaM9T","metadataUrl":"ipfs://QmTcQzQAMKUmBaGWAj7ncKHHiXLwMNevc7SdahF6AaQtKc"},"epic":{"imageHash":"QmZWCK8xYtsNJXv3vDWxqNvHo2EVsW2Pdifc6cciVSj3b8","metadataHash":"QmWwLc1tPdX6M9NyYFDVgxdDxxcbHjCLTb57MZ22EoVuAU","imageUrl":"ipfs://QmZWCK8xYtsNJXv3vDWxqNvHo2EVsW2Pdifc6cciVSj3b8","metadataUrl":"ipfs://QmWwLc1tPdX6M9NyYFDVgxdDxxcbHjCLTb57MZ22EoVuAU"},"legendary":{"imageHash":"QmUjJSHzfBow5yTf87KiFch5LMWohNnNkjqjoy6Bn8mDBM","metadataHash":"QmVHgJSJibkka1xEU1a5Ypj2CWu2QJHFfRbFjjykDwsVJz","imageUrl":"ipfs://QmUjJSHzfBow5yTf87KiFch5LMWohNnNkjqjoy6Bn8mDBM","metadataUrl":"ipfs://QmVHgJSJibkka1xEU1a5Ypj2CWu2QJHFfRbFjjykDwsVJz"}},"zephyrs":{"common":{"imageHash":"QmeBwAo6DisFLLfR3SnCuB87iAqGy6hXTsUQmS17dH3cSX","metadataHash":"QmQffQC3HTAVKtzfe5fWwqeKYDC93rDV1WLQcPwJzRwXLD","imageUrl":"ipfs://QmeBwAo6DisFLLfR3SnCuB87iAqGy6hXTsUQmS17dH3cSX","metadataUrl":"ipfs://QmQffQC3HTAVKtzfe5fWwqeKYDC93rDV1WLQcPwJzRwXLD"},"rare":{"imageHash":"QmQ8FEME4EaMczYs7P8MLpihLmqavomn97ChoEHRSVgasH","metadataHash":"Qme1sfwL8jvzDJVgJkcj7vvDHeF3LCCPSBYMa5mfED3yJq","imageUrl":"ipfs://QmQ8FEME4EaMczYs7P8MLpihLmqavomn97ChoEHRSVgasH","metadataUrl":"ipfs://Qme1sfwL8jvzDJVgJkcj7vvDHeF3LCCPSBYMa5mfED3yJq"},"epic":{"imageHash":"QmYCJDNDC3da5nhF9rukrd3FXw23bgMqbuy9qNnfqQaMXZ","metadataHash":"QmXs1JLLiERPuqNjbu9Z3CBHk9Wra3qxr4qJUNokuEQEGt","imageUrl":"ipfs://QmYCJDNDC3da5nhF9rukrd3FXw23bgMqbuy9qNnfqQaMXZ","metadataUrl":"ipfs://QmXs1JLLiERPuqNjbu9Z3CBHk9Wra3qxr4qJUNokuEQEGt"},"legendary":{"imageHash":"QmXRhhE3PKufajwuhACH4mdChzZMkSSeBfZ2pkoEfCa1Jg","metadataHash":"QmcGgEGisN85TuWfcXLKEALG7n7Z1nda162G2m6YBzjrcB","imageUrl":"ipfs://QmXRhhE3PKufajwuhACH4mdChzZMkSSeBfZ2pkoEfCa1Jg","metadataUrl":"ipfs://QmcGgEGisN85TuWfcXLKEALG7n7Z1nda162G2m6YBzjrcB"}},"kraths":{"common":{"imageHash":"QmU8W4GQHm6FMkarR7oFebreVhYjUj1eS1PG7H1SPokNVd","metadataHash":"Qmaaoydink9QvC2vhjcCNFnakCivCFkg1ZkSMCS93ryEGa","imageUrl":"ipfs://QmU8W4GQHm6FMkarR7oFebreVhYjUj1eS1PG7H1SPokNVd","metadataUrl":"ipfs://Qmaaoydink9QvC2vhjcCNFnakCivCFkg1ZkSMCS93ryEGa"},"rare":{"imageHash":"QmUCDkWbpefXX5NADCCL2RPPvM9LxwGNNX1mveKzGuG9wE","metadataHash":"QmSZCiyA4mCQ1iY8AP9271ekRMFy15DSnpuqxNhzYHMZt4","imageUrl":"ipfs://QmUCDkWbpefXX5NADCCL2RPPvM9LxwGNNX1mveKzGuG9wE","metadataUrl":"ipfs://QmSZCiyA4mCQ1iY8AP9271ekRMFy15DSnpuqxNhzYHMZt4"},"epic":{"imageHash":"QmX3xuKXHstoCc2hB3Bqgm3j1SyGAXTptRm1MQDirWrm5G","metadataHash":"QmSN3aVt4Z9B1CstaQd3CS462mfbnuvcnCt74MMHvNqKxC","imageUrl":"ipfs://QmX3xuKXHstoCc2hB3Bqgm3j1SyGAXTptRm1MQDirWrm5G","metadataUrl":"ipfs://QmSN3aVt4Z9B1CstaQd3CS462mfbnuvcnCt74MMHvNqKxC"},"legendary":{"imageHash":"QmYcXz1k4rTNny5ReoQ1APHRApVfAoZ4JSf7NLorXNqea3","metadataHash":"QmXdS7CWeN7Jt83GXqat5nSrKc7XRYABBVseCxtHxVsiDu","imageUrl":"ipfs://QmYcXz1k4rTNny5ReoQ1APHRApVfAoZ4JSf7NLorXNqea3","metadataUrl":"ipfs://QmXdS7CWeN7Jt83GXqat5nSrKc7XRYABBVseCxtHxVsiDu"}},"preservers":{"common":{"imageHash":"QmYBuQR893WJiGta2LPXLe1mJJnrz3Ez2m2JYHCJGX1URC","metadataHash":"QmZ22ZxZoAGJ4ZTb5zqvQzkFEEso17LXeTZXu3MGw1ads6","imageUrl":"ipfs://QmYBuQR893WJiGta2LPXLe1mJJnrz3Ez2m2JYHCJGX1URC","metadataUrl":"ipfs://QmZ22ZxZoAGJ4ZTb5zqvQzkFEEso17LXeTZXu3MGw1ads6"},"rare":{"imageHash":"QmSfUdUqzJG8NjF3KeitnXK8VxUK1rVTDsnjVLHAizkefF","metadataHash":"QmYTa7Gn8NzuzgDgxdXCWFn4EvcUsMnH3ErUagaF2F8PXE","imageUrl":"ipfs://QmSfUdUqzJG8NjF3KeitnXK8VxUK1rVTDsnjVLHAizkefF","metadataUrl":"ipfs://QmYTa7Gn8NzuzgDgxdXCWFn4EvcUsMnH3ErUagaF2F8PXE"},"epic":{"imageHash":"QmTGDg3rzRsBKNcvQYSmTXFu9P1ZFTN6dpTMBMiaQ5YHts","metadataHash":"QmV4C3MteDHoQFVz1VfLpay9GqtcteUwTze962bf9wU4B9","imageUrl":"ipfs://QmTGDg3rzRsBKNcvQYSmTXFu9P1ZFTN6dpTMBMiaQ5YHts","metadataUrl":"ipfs://QmV4C3MteDHoQFVz1VfLpay9GqtcteUwTze962bf9wU4B9"},"legendary":{"imageHash":"QmeGZYCayTH5rfqMDkBGHQ5HMnfJLmYmwWxLFq5DBU5K5u","metadataHash":"QmcntUeqHBN8h86yB8HNz8x8ugaTxX7KCqvRrY3QFxfZw2","imageUrl":"ipfs://QmeGZYCayTH5rfqMDkBGHQ5HMnfJLmYmwWxLFq5DBU5K5u","metadataUrl":"ipfs://QmcntUeqHBN8h86yB8HNz8x8ugaTxX7KCqvRrY3QFxfZw2"}},"synthetics":{"common":{"imageHash":"QmNh6wy28phqgxKyjyxpFxbeGPUBLCTByKeGwkEtRBaNKu","metadataHash":"QmPcKDYMczA3bwHC4zPtefoJ9SFUSfcX6y9Cv2FyxLoFtb","imageUrl":"ipfs://QmNh6wy28phqgxKyjyxpFxbeGPUBLCTByKeGwkEtRBaNKu","metadataUrl":"ipfs://QmPcKDYMczA3bwHC4zPtefoJ9SFUSfcX6y9Cv2FyxLoFtb"},"rare":{"imageHash":"QmPDmvHhrRtF5q8oMmSJbqnAEewq8BVLUsKBfEVxBW2fKi","metadataHash":"QmVrRsyt2eace3Qgs1HS5Jjupjujp5f7rusWiCfBj21VXf","imageUrl":"ipfs://QmPDmvHhrRtF5q8oMmSJbqnAEewq8BVLUsKBfEVxBW2fKi","metadataUrl":"ipfs://QmVrRsyt2eace3Qgs1HS5Jjupjujp5f7rusWiCfBj21VXf"},"epic":{"imageHash":"QmZ7kbm9pEkhy8ygMaUpti4n8H8aMtYCgjn6wWMdCoZfsq","metadataHash":"QmWap5U2wHrVoS3XirjxjgfPWwkrLEwz8KPeJagXArQkjp","imageUrl":"ipfs://QmZ7kbm9pEkhy8ygMaUpti4n8H8aMtYCgjn6wWMdCoZfsq","metadataUrl":"ipfs://QmWap5U2wHrVoS3XirjxjgfPWwkrLEwz8KPeJagXArQkjp"},"legendary":{"imageHash":"QmernB1cRTKbtBEfJR1WcAxiQDTdP4JJEE9AFNAnJp4Jk2","metadataHash":"QmYRJMFwkrmMSAxsmdWknADq5jb3uJu1EAALvXSkpmFJv6","imageUrl":"ipfs://QmernB1cRTKbtBEfJR1WcAxiQDTdP4JJEE9AFNAnJp4Jk2","metadataUrl":"ipfs://QmYRJMFwkrmMSAxsmdWknADq5jb3uJu1EAALvXSkpmFJv6"}},"aquarians":{"common":{"imageHash":"QmQKetGKgcfUtubvTjMnwk4vp1nqNpgDTR31Jz1CrTqejE","metadataHash":"Qmd58izNNSNNCyyEwNXRXTWTjC5YbEfyfvtapqcVDe1zXY","imageUrl":"ipfs://QmQKetGKgcfUtubvTjMnwk4vp1nqNpgDTR31Jz1CrTqejE","metadataUrl":"ipfs://Qmd58izNNSNNCyyEwNXRXTWTjC5YbEfyfvtapqcVDe1zXY"},"rare":{"imageHash":"QmYfXsZ7B5HFHWzD1Nef94NNC2DEPbB2kYxe5rzihuP3q5","metadataHash":"QmXDFQcizgzHEZ8U91WmUF19WhJAX383avSJnhmPQFGVc1","imageUrl":"ipfs://QmYfXsZ7B5HFHWzD1Nef94NNC2DEPbB2kYxe5rzihuP3q5","metadataUrl":"ipfs://QmXDFQcizgzHEZ8U91WmUF19WhJAX383avSJnhmPQFGVc1"},"epic":{"imageHash":"QmaV4RiqKbbwT7L4TLDMhABP3n3hff6Db3FGQwDmx83Qqb","metadataHash":"QmWBgRFwBZYitJiqV4MB5s47gA3hXJ6nmYd2vhy8c6yEgX","imageUrl":"ipfs://QmaV4RiqKbbwT7L4TLDMhABP3n3hff6Db3FGQwDmx83Qqb","metadataUrl":"ipfs://QmWBgRFwBZYitJiqV4MB5s47gA3hXJ6nmYd2vhy8c6yEgX"},"legendary":{"imageHash":"QmdacRScpyJtH1uohR5Q9opE1ohSTbxWwACMyjP446MxdU","metadataHash":"QmStnevno7LefbMhE7fkSQGiJ21aD6tL9vcaFKWpfFsmoa","imageUrl":"ipfs://QmdacRScpyJtH1uohR5Q9opE1ohSTbxWwACMyjP446MxdU","metadataUrl":"ipfs://QmStnevno7LefbMhE7fkSQGiJ21aD6tL9vcaFKWpfFsmoa"}},"ancients":{"common":{"imageHash":"QmcbNm17So8VuVV7cq3PoocJnhdqZAAPmSA2VFmHGMZX8y","metadataHash":"QmSL6dQ7HxRMzJrHRUnK593Nu2TwwqrpjGNKUXxP1svG42","imageUrl":"ipfs://QmcbNm17So8VuVV7cq3PoocJnhdqZAAPmSA2VFmHGMZX8y","metadataUrl":"ipfs://QmSL6dQ7HxRMzJrHRUnK593Nu2TwwqrpjGNKUXxP1svG42"},"rare":{"imageHash":"QmQFfsxDBfacCArd43x284rqXBx25CJ6qfnc29zMEVS7yZ","metadataHash":"QmXGwK78ZgXByD15DgiiBT2mGt7NU5dP59WoBfYD4hbsnE","imageUrl":"ipfs://QmQFfsxDBfacCArd43x284rqXBx25CJ6qfnc29zMEVS7yZ","metadataUrl":"ipfs://QmXGwK78ZgXByD15DgiiBT2mGt7NU5dP59WoBfYD4hbsnE"},"epic":{"imageHash":"Qme3a4PEBgFrMZv8KPV8s1J5mBF6uWdn2Hc35orraVUi9w","metadataHash":"QmXGrhNhavhcVWcHkmiBQ4HsK9vXbhESLLSqDbcWiwKLCm","imageUrl":"ipfs://Qme3a4PEBgFrMZv8KPV8s1J5mBF6uWdn2Hc35orraVUi9w","metadataUrl":"ipfs://QmXGrhNhavhcVWcHkmiBQ4HsK9vXbhESLLSqDbcWiwKLCm"},"legendary":{"imageHash":"Qme8v7yePNJx1ts7QRAetffyTiZWPi3gBW3iP9iaQyVyvn","metadataHash":"QmSk9V3E9bLrsDTfvcPuDxnftxUpP54ZgTbLZFrBiJmwR8","imageUrl":"ipfs://Qme8v7yePNJx1ts7QRAetffyTiZWPi3gBW3iP9iaQyVyvn","metadataUrl":"ipfs://QmSk9V3E9bLrsDTfvcPuDxnftxUpP54ZgTbLZFrBiJmwR8"}}});}),
"[project]/components/MintCard.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MintCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/public/ipfs-hashes.json (json)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
// Informations sur les 7 races aliens
const ALIEN_RACES = {
    0: {
        name: 'Humans',
        emoji: '👨‍🚀',
        color: '#6b7280',
        description: 'L\'humanité explorant l\'espace',
        traits: [
            'Adaptables',
            'Intelligents',
            'Courageux'
        ]
    },
    1: {
        name: 'Zephyrs',
        emoji: '💨',
        color: '#06b6d4',
        description: 'Créatures éthérées des tempêtes célestes',
        traits: [
            'Rapides',
            'Insaisissables',
            'Gracieux'
        ]
    },
    2: {
        name: 'Kraths',
        emoji: '⚔️',
        color: '#dc2626',
        description: 'Guerriers blindés d\'une grande force',
        traits: [
            'Puissants',
            'Résistants',
            'Guerriers'
        ]
    },
    3: {
        name: 'Preservers',
        emoji: '🌿',
        color: '#16a34a',
        description: 'Gardiens anciens de la nature cosmique',
        traits: [
            'Sages',
            'Anciens',
            'Protecteurs'
        ]
    },
    4: {
        name: 'Synthetics',
        emoji: '🤖',
        color: '#8b5cf6',
        description: 'Entités artificielles ultra-évoluées',
        traits: [
            'Logiques',
            'Précis',
            'Innovants'
        ]
    },
    5: {
        name: 'Aquarians',
        emoji: '🌊',
        color: '#0ea5e9',
        description: 'Êtres aquatiques des mondes océans',
        traits: [
            'Fluides',
            'Mystérieux',
            'Adaptés'
        ]
    },
    6: {
        name: 'Ancients',
        emoji: '✨',
        color: '#fbbf24',
        description: 'Civilisation ancienne transcendante',
        traits: [
            'Mystiques',
            'Puissants',
            'Légendaires'
        ]
    }
};
function MintCard({ account, onMintSuccess }) {
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [waitingForConfirmation, setWaitingForConfirmation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmationBlocks, setConfirmationBlocks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [txHash, setTxHash] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [progressStep, setProgressStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(''); // "selectionning", "confirming", "waiting", "vrf", "finalizing"
    const [progressMessage, setProgressMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [cooldown, setCooldown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [cardBalance, setCardBalance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [useTestMint, setUseTestMint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true); // Mode test par défaut
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MintCard.useEffect": ()=>{
            if (account) {
                checkCooldownAndBalance();
            }
        }
    }["MintCard.useEffect"], [
        account
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MintCard.useEffect": ()=>{
            if (cooldown > 0) {
                const timer = setInterval({
                    "MintCard.useEffect.timer": ()=>{
                        setCooldown({
                            "MintCard.useEffect.timer": (prev)=>prev > 0 ? prev - 1 : 0
                        }["MintCard.useEffect.timer"]);
                    }
                }["MintCard.useEffect.timer"], 1000);
                return ({
                    "MintCard.useEffect": ()=>clearInterval(timer)
                })["MintCard.useEffect"];
            }
        }
    }["MintCard.useEffect"], [
        cooldown
    ]);
    // Écouter l'événement CardMinted du contrat
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MintCard.useEffect": ()=>{
            if (!account || !txHash) return;
            let isSubscribed = true;
            let unsubscribe = null;
            const listenForCardMinted = {
                "MintCard.useEffect.listenForCardMinted": async ()=>{
                    try {
                        console.log(`👂 Configuration du listener CardMinted...`);
                        const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
                        // Créer un filter pour l'événement CardMinted
                        // Paramètres: (tokenId, owner, race, rarity)
                        const filter = contract.filters.CardMinted(null, account);
                        // Listener pour l'événement CardMinted
                        const handleCardMinted = {
                            "MintCard.useEffect.listenForCardMinted.handleCardMinted": (tokenId, owner, race, rarity, event)=>{
                                if (!isSubscribed) return;
                                if (owner.toLowerCase() === account.toLowerCase()) {
                                    const raceNames = [
                                        'Humans',
                                        'Zephyrs',
                                        'Kraths',
                                        'Preservers',
                                        'Synthetics',
                                        'Aquarians',
                                        'Ancients'
                                    ];
                                    const rarityNames = [
                                        'Common',
                                        'Rare',
                                        'Epic',
                                        'Legendary'
                                    ];
                                    const raceName = raceNames[race] || `Race ${race}`;
                                    const rarityName = rarityNames[rarity] || `Rarity ${rarity}`;
                                    console.log(`🎉 ÉVÉNEMENT CardMinted détecté!`);
                                    console.log(`   TokenID: ${tokenId}`);
                                    console.log(`   Race: ${raceName}`);
                                    console.log(`   Rareté: ${rarityName}`);
                                    console.log(`   Block: ${event.blockNumber}`);
                                    setSuccess(`🎉 Carte créée!\n⭐ ${raceName} - ${rarityName}\n🆔 Token #${tokenId}\n✅ Confirmée!`);
                                }
                            }
                        }["MintCard.useEffect.listenForCardMinted.handleCardMinted"];
                        // Écouter les événements futurs
                        contract.on(filter, handleCardMinted);
                        console.log(`✅ Listener CardMinted activé pour ${account.substring(0, 10)}...`);
                        // Nettoyer le listener au unmount
                        unsubscribe = ({
                            "MintCard.useEffect.listenForCardMinted": ()=>{
                                if (contract) {
                                    contract.off(filter, handleCardMinted);
                                    console.log(`👂 Listener CardMinted désactivé`);
                                }
                            }
                        })["MintCard.useEffect.listenForCardMinted"];
                    } catch (error) {
                        console.error("Erreur lors de la mise en place du listener:", error);
                    }
                }
            }["MintCard.useEffect.listenForCardMinted"];
            listenForCardMinted();
            // Cleanup
            return ({
                "MintCard.useEffect": ()=>{
                    isSubscribed = false;
                    if (unsubscribe) {
                        unsubscribe();
                    }
                }
            })["MintCard.useEffect"];
        }
    }["MintCard.useEffect"], [
        account,
        txHash
    ]);
    const checkCooldownAndBalance = async ()=>{
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
            // Vérifier le cooldown
            const lastTx = await contract.lastTransactionTime(account);
            const now = Math.floor(Date.now() / 1000);
            const remaining = Math.max(0, 300 - (now - Number(lastTx)));
            setCooldown(remaining);
            // Vérifier le nombre de cartes
            const balance = await contract.balanceOf(account);
            setCardBalance(Number(balance));
        } catch (error) {
            console.error("Erreur lors de la vérification:", error);
        }
    };
    const getRandomIPFSHash = ()=>{
        try {
            // Valider les données IPFS
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"] || Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"]).length === 0) {
                throw new Error("Données IPFS non disponibles");
            }
            // Choisir une race aléatoire
            const races = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"]);
            const randomRace = races[Math.floor(Math.random() * races.length)];
            // Choisir une rareté aléatoire (basée sur les probabilités)
            const rand = Math.random() * 100;
            let rarity;
            if (rand < 70) rarity = 'common';
            else if (rand < 90) rarity = 'rare';
            else if (rand < 98) rarity = 'epic';
            else rarity = 'legendary';
            const hash = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][randomRace]?.[rarity]?.metadataHash;
            if (!hash) {
                console.warn(`Hash non trouvé pour ${randomRace} - ${rarity}`);
                // Fallback: essayer de récupérer n'importe quel hash disponible
                const firstRace = races[0];
                const firstRarity = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][firstRace])[0];
                return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][firstRace][firstRarity].metadataHash;
            }
            console.log(`📌 Hash IPFS sélectionné - Race: ${randomRace}, Rareté: ${rarity}, Hash: ${hash.substring(0, 10)}...`);
            return hash;
        } catch (error) {
            console.error("Erreur lors de la récupération du hash IPFS:", error);
            throw error;
        }
    };
    const handleMint = async ()=>{
        if (!account) {
            setError("Veuillez connecter votre wallet");
            return;
        }
        if (cardBalance >= 10) {
            setError("Vous avez atteint la limite de 10 cartes. Fusionnez ou échangez des cartes.");
            return;
        }
        if (cooldown > 0) {
            setError(`Cooldown actif. Attendez ${formatCooldown(cooldown)}`);
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        setProgressStep('selecting');
        setProgressMessage('⏳ Sélection des attributs aléatoires...');
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
            // Étape 1: Sélection des attributs
            setProgressMessage('🎲 Tirage aléatoire de la race et rareté...');
            await new Promise((r)=>setTimeout(r, 500)); // Simulation d'attente
            const ipfsHash = getRandomIPFSHash();
            // S'assurer que le hash est une chaîne valide
            if (!ipfsHash || ipfsHash.trim().length === 0) {
                setError("Erreur: Hash IPFS invalide");
                setLoading(false);
                setProgressStep('');
                return;
            }
            console.log(`🚀 Début du mint - Compte: ${account}, Hash IPFS: ${ipfsHash.substring(0, 20)}...`);
            let tx;
            let isVRFMode = false;
            if (useTestMint) {
                // Utiliser testMint pour les tests (ne nécessite pas VRF)
                setProgressStep('confirming');
                setProgressMessage('📤 Transaction en cours...\n🦊 Vérification par Metamask');
                const randomness = Math.floor(Math.random() * 1000000);
                console.log(`🧪 Appel testMint - Hash: ${ipfsHash.substring(0, 20)}..., Randomness: ${randomness}`);
                console.log(`📋 Contrat exists: ${!!contract}, testMint exists: ${typeof contract.testMint}`);
                try {
                    setSuccess("🦊 Vérification par Metamask... Veuillez confirmer la transaction.");
                    console.log(`📤 Envoi de testMint...`);
                    tx = await contract.testMint(ipfsHash, randomness);
                    console.log(`✅ Transaction envoyée! Hash: ${tx.hash}`);
                    setTxHash(tx.hash);
                    setProgressMessage(`✅ Transaction envoyée!\n⏳ Blockchain en cours...`);
                    setSuccess(`✅ Transaction reçue!\n⏳ En attente de confirmation...\n🔗 ${tx.hash.substring(0, 20)}...`);
                    // Attendre la confirmation
                    const receipt = await tx.wait();
                    console.log(`✅ Confirmée! Block: ${receipt.blockNumber}`);
                    setProgressMessage(`✅ Carte créée!`);
                    setSuccess(`✅ Carte créée avec succès!\n📊 Block: ${receipt.blockNumber}`);
                    // Rafraîchir
                    setLoading(false);
                    setWaitingForConfirmation(false);
                    await checkCooldownAndBalance();
                    if (onMintSuccess) {
                        console.log(`📢 Appel onMintSuccess`);
                        onMintSuccess();
                        await new Promise((r)=>setTimeout(r, 1000));
                        onMintSuccess();
                    }
                    setTimeout(()=>{
                        setProgressStep('');
                        setProgressMessage('');
                        setTxHash('');
                    }, 3000);
                } catch (error) {
                    console.error(`❌ Erreur testMint:`, error);
                    setProgressStep('');
                    if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
                        setError("❌ Transaction rejetée par l'utilisateur");
                    } else {
                        setError(`⚠️ ${error.message || 'Erreur testMint'}`);
                    }
                }
            } else {
                // Utiliser mint normal (nécessite VRF Chainlink)
                setProgressStep('confirming');
                setProgressMessage('📤 Transaction en cours...\n🦊 Vérification par Metamask');
                console.log(`⚙️ Appel mint - Hash: ${ipfsHash.substring(0, 20)}...`);
                try {
                    setSuccess("🦊 Vérification par Metamask... Veuillez confirmer la transaction.");
                    tx = await contract.mint(ipfsHash);
                    console.log(`✅ Transaction envoyée! Hash: ${tx.hash}`);
                    setTxHash(tx.hash);
                    setProgressMessage(`✅ Transaction envoyée!\n⏳ VRF Chainlink...`);
                    setSuccess(`✅ Transaction reçue!\n⏳ Attente VRF (10-30s)...`);
                    // Attendre la confirmation
                    const receipt = await tx.wait();
                    console.log(`✅ Confirmée! Block: ${receipt.blockNumber}`);
                    setSuccess(`✅ Carte créée avec succès!\n📊 Block: ${receipt.blockNumber}`);
                    // Rafraîchir
                    setLoading(false);
                    setWaitingForConfirmation(false);
                    await checkCooldownAndBalance();
                    if (onMintSuccess) {
                        console.log(`📢 Appel onMintSuccess`);
                        onMintSuccess();
                        await new Promise((r)=>setTimeout(r, 1000));
                        onMintSuccess();
                    }
                    setTimeout(()=>{
                        setProgressStep('');
                        setProgressMessage('');
                        setTxHash('');
                    }, 3000);
                } catch (error) {
                    console.error(`❌ Erreur mint:`, error);
                    setProgressStep('');
                    setLoading(false);
                    if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
                        setError("❌ Transaction rejetée par l'utilisateur");
                    } else {
                        setError(`⚠️ ${error.message || 'Erreur mint'}`);
                    }
                }
            }
        } catch (error) {
            console.error("❌ Erreur générale:", error);
            setProgressStep('error');
            setLoading(false);
            setError(`⚠️ ${error.message || "Erreur lors du mint"}`);
        } finally{
            setLoading(false);
            setWaitingForConfirmation(false);
        }
    };
    const formatCooldown = (seconds)=>{
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mint-card-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "🚀 Minter une nouvelle carte"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 377,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Créez une carte spatiale aléatoire avec Chainlink VRF"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 378,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 376,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mint-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "info-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "label",
                                children: "Vos cartes:"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 383,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "value",
                                children: [
                                    cardBalance,
                                    " / 10"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 384,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 382,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "info-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "label",
                                children: "Cooldown:"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 387,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "value",
                                children: cooldown > 0 ? formatCooldown(cooldown) : "✅ Disponible"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 388,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 386,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 381,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleMint,
                disabled: loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10 || !account,
                className: "btn btn-mint btn-mint-primary",
                style: {
                    fontSize: '1.2rem',
                    padding: '16px 32px',
                    minHeight: '60px',
                    fontWeight: 'bold',
                    backgroundImage: loading || waitingForConfirmation ? 'none' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10 ? 'none' : '0 0 20px rgba(99, 102, 241, 0.5)',
                    transform: loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10 ? 'scale(1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: loading || waitingForConfirmation ? 0.7 : 1
                },
                children: waitingForConfirmation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginRight: '8px',
                                animation: 'spin 1s linear infinite'
                            },
                            children: "⏳"
                        }, void 0, false, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 412,
                            columnNumber: 13
                        }, this),
                        "Confirmation... (",
                        confirmationBlocks,
                        " bloc)"
                    ]
                }, void 0, true) : loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginRight: '8px'
                            },
                            children: "⏳"
                        }, void 0, false, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 417,
                            columnNumber: 13
                        }, this),
                        "Mint en cours..."
                    ]
                }, void 0, true) : cooldown > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginRight: '8px'
                            },
                            children: "⏱️"
                        }, void 0, false, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 422,
                            columnNumber: 13
                        }, this),
                        "Attendez ",
                        formatCooldown(cooldown)
                    ]
                }, void 0, true) : cardBalance >= 10 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginRight: '8px'
                            },
                            children: "🚫"
                        }, void 0, false, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 427,
                            columnNumber: 13
                        }, this),
                        "Flotte pleine (10/10)"
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                marginRight: '8px'
                            },
                            children: "🎲"
                        }, void 0, false, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 432,
                            columnNumber: 13
                        }, this),
                        "Minter une Carte"
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 394,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '15px',
                    padding: '10px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: useTestMint,
                                onChange: (e)=>setUseTestMint(e.target.checked),
                                style: {
                                    cursor: 'pointer'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 440,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.9rem'
                                },
                                children: useTestMint ? '🧪 Mode TEST (testMint)' : '⚙️ Mode VRF (mint)'
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 446,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 439,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginTop: '4px'
                        },
                        children: useTestMint ? 'Utilise testMint - Pas de VRF requis (recommandé pour tester)' : 'Utilise mint avec VRF - Nécessite LINK dans le contrat'
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 450,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 438,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-error",
                children: [
                    "❌ ",
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 458,
                columnNumber: 9
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 464,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mint-details",
                style: {
                    marginTop: '20px',
                    marginBottom: '25px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    border: '2px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    padding: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--primary)'
                        },
                        children: "⚙️ Règles et Contraintes"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 471,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '15px',
                                    background: 'rgba(251, 146, 60, 0.1)',
                                    border: '1px solid rgba(251, 146, 60, 0.3)',
                                    borderRadius: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.5em'
                                                },
                                                children: "⏱️"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 479,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-primary)'
                                                },
                                                children: "Cooldown"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 480,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 478,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.9em',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            "Attendez ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: '#f97316'
                                                },
                                                children: "5 minutes"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 483,
                                                columnNumber: 24
                                            }, this),
                                            " entre chaque transaction"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 482,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.8em',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: [
                                            "État actuel: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: cooldown > 0 ? '#ef4444' : '#10b981'
                                                },
                                                children: cooldown > 0 ? `${formatCooldown(cooldown)} restant` : 'Disponible ✓'
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 486,
                                                columnNumber: 28
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 485,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 477,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '15px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.5em'
                                                },
                                                children: "🎴"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 495,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-primary)'
                                                },
                                                children: "Limite Cartes"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 496,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 494,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.9em',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            "Stockage max: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: '#3b82f6'
                                                },
                                                children: "10 cartes"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 499,
                                                columnNumber: 29
                                            }, this),
                                            " par wallet"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 498,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.8em',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: [
                                            "Vous en avez: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: cardBalance >= 10 ? '#ef4444' : '#10b981'
                                                },
                                                children: [
                                                    cardBalance,
                                                    "/10"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 502,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 501,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 493,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '15px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.5em'
                                                },
                                                children: "💰"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 511,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-primary)'
                                                },
                                                children: "Frais TX"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 512,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 510,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.9em',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        },
                                        children: "Gas variable selon réseau Sepolia"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 514,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.8em',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "💡 Vérifiez votre solde ETH sur Sepolia"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 517,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 509,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '15px',
                                    background: useTestMint ? 'rgba(168, 85, 247, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                    border: useTestMint ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.5em'
                                                },
                                                children: useTestMint ? '🧪' : '🔗'
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 525,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 'bold',
                                                    color: 'var(--text-primary)'
                                                },
                                                children: "Mode Mint"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 526,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 524,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.9em',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        },
                                        children: useTestMint ? 'Mode TEST (rapide, sans VRF)' : 'Mode VRF (10-30s, aléatoire certifié)'
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 528,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.8em',
                                            color: 'var(--text-secondary)'
                                        },
                                        children: "Changez le mode ci-dessous"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 531,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 523,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 475,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '15px',
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.9em'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "📋"
                                }, void 0, false, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 539,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--text-primary)'
                                            },
                                            children: "À savoir:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 541,
                                            columnNumber: 15
                                        }, this),
                                        " Ces contraintes protègent le protocole contre les abus. Vous pouvez échangez ou fusionner vos cartes pour faire de la place. Chaque mint a un coût en gas (frais réseau Sepolia)."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 540,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 538,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 537,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 470,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mint-details",
                style: {
                    marginTop: '30px',
                    marginBottom: '30px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        children: "👽 Les 7 Races de l'Andromeda"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 549,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                            marginBottom: '15px'
                        },
                        children: Object.entries(ALIEN_RACES).map(([raceId, race])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '15px',
                                    background: `linear-gradient(135deg, ${race.color}15 0%, ${race.color}05 100%)`,
                                    border: `2px solid ${race.color}40`,
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = `0 8px 16px ${race.color}30`;
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '2.5em',
                                            marginBottom: '8px'
                                        },
                                        children: race.emoji
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 575,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 'bold',
                                            fontSize: '1.1em',
                                            marginBottom: '4px',
                                            color: race.color
                                        },
                                        children: race.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 576,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.75em',
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.3'
                                        },
                                        children: race.description
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 579,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.7em',
                                            marginTop: '8px',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '4px',
                                            justifyContent: 'center'
                                        },
                                        children: race.traits.map((trait, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    background: `${race.color}30`,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    color: race.color
                                                },
                                                children: trait
                                            }, idx, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 584,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 582,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, raceId, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 555,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 553,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '0.9em',
                            color: 'var(--text-secondary)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "🎯"
                                }, void 0, false, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 595,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--text-primary)'
                                            },
                                            children: "Info:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 597,
                                            columnNumber: 15
                                        }, this),
                                        " Chaque race possède des caractéristiques uniques. Le tirage aléatoire vous permettra de collectionner toutes les 7 races dans chaque niveau de rareté!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 596,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 594,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 593,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 548,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mint-details",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        children: "📊 Probabilités de rareté"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 604,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gap: '12px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(107, 114, 128, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: 'bold'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "⚪"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MintCard.js",
                                                        lineNumber: 613,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Common"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 612,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#6b7280'
                                                },
                                                children: "70%"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 615,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 611,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '24px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '70%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.85em'
                                            },
                                            children: "70%"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 618,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 617,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 610,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: 'bold'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "🔵"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MintCard.js",
                                                        lineNumber: 628,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Rare"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 627,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#3b82f6'
                                                },
                                                children: "20%"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 630,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 626,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '24px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '20%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.85em'
                                            },
                                            children: "20%"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 633,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 632,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 625,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: 'bold'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "🟣"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MintCard.js",
                                                        lineNumber: 643,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Epic"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 642,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#8b5cf6'
                                                },
                                                children: "8%"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 645,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 641,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '24px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '8%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.75em'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 648,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 647,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 640,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    borderRadius: '8px',
                                    border: '2px solid rgba(251, 191, 36, 0.5)',
                                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontWeight: 'bold'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "🟡"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MintCard.js",
                                                        lineNumber: 657,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Legendary ⭐"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 656,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#fbbf24'
                                                },
                                                children: "2%"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MintCard.js",
                                                lineNumber: 659,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 655,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '24px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '2%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #fbbf24 0%, #fcd34d 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                fontSize: '0.75em'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 662,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/MintCard.js",
                                        lineNumber: 661,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 654,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 608,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '15px',
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.9em',
                            color: 'var(--text-secondary)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "💡"
                                }, void 0, false, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 670,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--text-primary)'
                                            },
                                            children: "Astuce:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MintCard.js",
                                            lineNumber: 672,
                                            columnNumber: 15
                                        }, this),
                                        " Les probabilités sont déterminées aléatoirement. Plus haute la rareté, plus rare la carte!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MintCard.js",
                                    lineNumber: 671,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MintCard.js",
                            lineNumber: 669,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 668,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 603,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MintCard.js",
        lineNumber: 375,
        columnNumber: 5
    }, this);
}
_s(MintCard, "trgzq8WXwuEt+PM228067MSKxxE=");
_c = MintCard;
var _c;
__turbopack_context__.k.register(_c, "MintCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CardDisplay.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CardDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/contractConfig.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function CardDisplay({ card, tokenId, onSelect, selected }) {
    _s();
    const [imageLoading, setImageLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [imageError, setImageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!card) return null;
    const raceNumber = typeof card.race === 'object' ? card.race._hex ? parseInt(card.race._hex, 16) : card.race : card.race;
    const rarityNumber = typeof card.rarity === 'object' ? card.rarity._hex ? parseInt(card.rarity._hex, 16) : card.rarity : card.rarity;
    const raceName = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["RACE_NAMES"][raceNumber] || 'Unknown';
    const rarityName = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["RARITY_NAMES"][rarityNumber] || 'Unknown';
    const rarityColor = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$client$5d$__$28$ecmascript$29$__["RARITY_COLORS"][rarityNumber] || '#9CA3AF';
    const locked = card.isLocked && (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["isCardLocked"])(card.lockUntil);
    const imageUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getIPFSUrl"])(card.ipfsHash);
    const handleClick = ()=>{
        if (onSelect && !locked) {
            onSelect(tokenId);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `card-item ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`,
        onClick: handleClick,
        style: {
            borderColor: rarityColor
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rarity-badge",
                style: {
                    backgroundColor: rarityColor
                },
                children: rarityName
            }, void 0, false, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-image-container",
                children: imageUrl && !imageError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        imageLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "image-loading",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "spinner"
                            }, void 0, false, {
                                fileName: "[project]/components/CardDisplay.js",
                                lineNumber: 44,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CardDisplay.js",
                            lineNumber: 43,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: imageUrl,
                            alt: card.name,
                            className: `card-image ${imageLoading ? 'loading' : ''}`,
                            onLoad: ()=>setImageLoading(false),
                            onError: ()=>{
                                setImageError(true);
                                setImageLoading(false);
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/CardDisplay.js",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card-placeholder",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "placeholder-icon",
                            children: "🚀"
                        }, void 0, false, {
                            fileName: "[project]/components/CardDisplay.js",
                            lineNumber: 60,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "placeholder-race",
                            children: raceName
                        }, void 0, false, {
                            fileName: "[project]/components/CardDisplay.js",
                            lineNumber: 61,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CardDisplay.js",
                    lineNumber: 59,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "card-name",
                        children: card.name
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-race",
                        children: [
                            "Race: ",
                            raceName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-value",
                        children: [
                            "Valeur: ",
                            card.value?.toString() || '0'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-id",
                        children: [
                            "Token ID: #",
                            tokenId
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-status",
                children: [
                    locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "status-locked",
                        children: "🔒 Verrouillée"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "status-selected",
                        children: "✓ Sélectionnée"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-metadata",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-created",
                        children: [
                            "Créée: ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatTimestamp"])(card.createdAt)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    card.lastTransferAt && card.lastTransferAt > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "card-transfer",
                        children: [
                            "Transférée: ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["formatTimestamp"])(card.lastTransferAt)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            card.previousOwners && card.previousOwners.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-history",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "history-title",
                        children: "Propriétaires précédents:"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "history-count",
                        children: [
                            card.previousOwners.length,
                            " propriétaire(s)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 102,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CardDisplay.js",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(CardDisplay, "1QKq6MuANuDh8ZIYL1gx4ygMTJo=");
_c = CardDisplay;
var _c;
__turbopack_context__.k.register(_c, "CardDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/MyCards.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MyCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function MyCards({ account, refreshTrigger }) {
    _s();
    const [cards, setCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MyCards.useEffect": ()=>{
            if (account) {
                loadCards();
            }
        }
    }["MyCards.useEffect"], [
        account,
        refreshTrigger
    ]);
    const loadCards = async ()=>{
        if (!account) return;
        setLoading(true);
        setError('');
        try {
            // Petit délai pour s'assurer que la blockchain a finalisé la transaction
            await new Promise((resolve)=>setTimeout(resolve, 500));
            const tokenIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getAllTokenIds"])(account);
            console.log(`📌 getAllTokenIds retourné: ${tokenIds.length} cartes`);
            if (tokenIds.length === 0) {
                setCards([]);
                setLoading(false);
                return;
            }
            // Charger les détails de chaque carte via cards(tokenId)
            const cardsData = await Promise.all(tokenIds.map((tokenId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getCardDetails"])(tokenId)));
            const validCards = cardsData.filter(Boolean);
            console.log(`🎴 Cartes chargées: ${validCards.length}/${tokenIds.length}`);
            setCards(validCards);
        } catch (error) {
            console.error("Erreur lors du chargement des cartes:", error);
            setError("Impossible de charger vos cartes");
        } finally{
            setLoading(false);
        }
    };
    if (!account) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-info",
                children: "Connectez votre wallet pour voir vos cartes"
            }, void 0, false, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 54,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 53,
            columnNumber: 7
        }, this);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "spinner"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Chargement de vos cartes..."
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 64,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "alert alert-error",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/MyCards.js",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: loadCards,
                    className: "btn btn-secondary",
                    children: "Réessayer"
                }, void 0, false, {
                    fileName: "[project]/components/MyCards.js",
                    lineNumber: 78,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 74,
            columnNumber: 7
        }, this);
    }
    if (cards.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "empty-state",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "🚀 Aucune carte pour le moment"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Mintez votre première carte pour commencer votre collection!"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 88,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 87,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "my-cards-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "🎴 Ma Collection"
                            }, void 0, false, {
                                fileName: "[project]/components/MyCards.js",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    cards.length,
                                    " carte",
                                    cards.length > 1 ? 's' : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MyCards.js",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: loadCards,
                        className: "btn btn-refresh",
                        children: "🔄 Rafraîchir"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cards-grid",
                children: cards.map((cardData)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        tokenId: cardData.tokenId,
                        card: cardData
                    }, cardData.tokenId, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MyCards.js",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
_s(MyCards, "FT4t0+MEDd8qbgqAw752MH9D7oc=");
_c = MyCards;
var _c;
__turbopack_context__.k.register(_c, "MyCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/config.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Configuration du contrat Andromeda Protocol
__turbopack_context__.s([
    "CONTRACT_ADDRESS",
    ()=>CONTRACT_ADDRESS,
    "IPFS_GATEWAY",
    ()=>IPFS_GATEWAY,
    "LOCK_DURATION",
    ()=>LOCK_DURATION,
    "MAX_CARDS_PER_OWNER",
    ()=>MAX_CARDS_PER_OWNER,
    "RACE",
    ()=>RACE,
    "RARITY",
    ()=>RARITY,
    "RARITY_VALUES",
    ()=>RARITY_VALUES,
    "SEPOLIA_CHAIN_ID",
    ()=>SEPOLIA_CHAIN_ID,
    "SEPOLIA_NETWORK",
    ()=>SEPOLIA_NETWORK,
    "TRANSACTION_COOLDOWN",
    ()=>TRANSACTION_COOLDOWN
]);
const CONTRACT_ADDRESS = "0x317Fbed8fD8491B080f98A8e3540A6cb190908d7";
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 en hexadécimal
const SEPOLIA_NETWORK = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: "Sepolia Testnet",
    nativeCurrency: {
        name: "Sepolia ETH",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: [
        "https://sepolia.infura.io/v3/"
    ],
    blockExplorerUrls: [
        "https://sepolia.etherscan.io/"
    ]
};
const RARITY = {
    0: "Common",
    1: "Rare",
    2: "Epic",
    3: "Legendary"
};
const RACE = {
    0: "Humans",
    1: "Zephyrs",
    2: "Kraths",
    3: "Preservers",
    4: "Synthetics",
    5: "Aquarians",
    6: "Ancients"
};
const RARITY_VALUES = {
    Common: 100,
    Rare: 300,
    Epic: 700,
    Legendary: 1000
};
const MAX_CARDS_PER_OWNER = 10;
const TRANSACTION_COOLDOWN = 5 * 60; // 5 minutes en secondes
const LOCK_DURATION = 10 * 60; // 10 minutes en secondes
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ExchangeCards.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExchangeCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function ExchangeCards({ account, userCards, onExchangeSuccess }) {
    _s();
    const [selectedMyCard, setSelectedMyCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [otherUserAddress, setOtherUserAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [otherUserCards, setOtherUserCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedOtherCard, setSelectedOtherCard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isExchanging, setIsExchanging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const loadOtherUserCards = async ()=>{
        if (!otherUserAddress || otherUserAddress.length !== 42) {
            setError('Adresse invalide');
            return;
        }
        if (otherUserAddress.toLowerCase() === account.toLowerCase()) {
            setError('Vous ne pouvez pas échanger avec vous-même');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
            const balance = await contract.balanceOf(otherUserAddress);
            const balanceNum = Number(balance);
            const cards = [];
            for(let i = 0; i < balanceNum; i++){
                const tokenId = await contract.tokenOfOwnerByIndex(otherUserAddress, i);
                const cardData = await contract.cards(tokenId);
                cards.push({
                    tokenId: tokenId.toString(),
                    name: cardData.name,
                    race: cardData.race,
                    rarity: cardData.rarity,
                    value: cardData.value,
                    ipfsHash: cardData.ipfsHash,
                    isLocked: cardData.isLocked,
                    lockUntil: Number(cardData.lockUntil)
                });
            }
            setOtherUserCards(cards);
        } catch (error) {
            setError('Impossible de charger les cartes');
        } finally{
            setIsLoading(false);
        }
    };
    const handleExchange = async ()=>{
        if (!selectedMyCard || !selectedOtherCard) return;
        setIsExchanging(true);
        setError('');
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
            const tx = await contract.exchange(selectedMyCard.tokenId, otherUserAddress, selectedOtherCard.tokenId);
            setSuccess('⏳ Transaction en cours...');
            await tx.wait();
            setSuccess('✅ Échange réussi !');
            if (onExchangeSuccess) setTimeout(()=>onExchangeSuccess(), 2000);
        } catch (error) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["handleTransactionError"])(error));
        } finally{
            setIsExchanging(false);
        }
    };
    const exchangeableCards = (userCards || []).filter((card)=>{
        const now = Math.floor(Date.now() / 1000);
        return !card.isLocked || card.lockUntil <= now;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-fb80ac410422e3e1" + " " + "exchange-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "jsx-fb80ac410422e3e1",
                children: "🔄 Échanger des Cartes"
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "1. Votre carte"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-fb80ac410422e3e1" + " " + "cards-grid",
                        children: exchangeableCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                card: card,
                                onSelect: ()=>setSelectedMyCard(card),
                                isSelected: selectedMyCard?.tokenId === card.tokenId
                            }, card.tokenId, false, {
                                fileName: "[project]/components/ExchangeCards.js",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "2. Adresse de l'autre utilisateur"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "0x...",
                        value: otherUserAddress,
                        onChange: (e)=>setOtherUserAddress(e.target.value),
                        className: "jsx-fb80ac410422e3e1" + " " + "address-input"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: loadOtherUserCards,
                        disabled: isLoading,
                        className: "jsx-fb80ac410422e3e1",
                        children: isLoading ? 'Chargement...' : 'Charger'
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            otherUserCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "3. Carte à recevoir"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-fb80ac410422e3e1" + " " + "cards-grid",
                        children: otherUserCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                card: card,
                                onSelect: ()=>setSelectedOtherCard(card),
                                isSelected: selectedOtherCard?.tokenId === card.tokenId
                            }, card.tokenId, false, {
                                fileName: "[project]/components/ExchangeCards.js",
                                lineNumber: 128,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 124,
                columnNumber: 9
            }, this),
            selectedMyCard && selectedOtherCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleExchange,
                disabled: isExchanging,
                className: "jsx-fb80ac410422e3e1" + " " + "btn-exchange",
                children: isExchanging ? 'Échange en cours...' : 'Confirmer l\'échange'
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 140,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 145,
                columnNumber: 17
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 146,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "fb80ac410422e3e1",
                children: ".exchange-container.jsx-fb80ac410422e3e1{max-width:1200px;margin:0 auto}.exchange-section.jsx-fb80ac410422e3e1{background:#ffffff0d;border-radius:12px;margin:2rem 0;padding:1.5rem}.cards-grid.jsx-fb80ac410422e3e1{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;display:grid}.address-input.jsx-fb80ac410422e3e1{color:#fff;background:#ffffff1a;border:2px solid #fff3;border-radius:8px;width:100%;padding:1rem}.btn-exchange.jsx-fb80ac410422e3e1{color:#fff;cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:12px;width:100%;padding:1.5rem;font-size:1.25rem;font-weight:700}.alert.jsx-fb80ac410422e3e1{text-align:center;border-radius:8px;margin-top:1rem;padding:1rem}.alert-error.jsx-fb80ac410422e3e1{color:#ef4444;background:#ef44441a}.alert-success.jsx-fb80ac410422e3e1{color:#10b981;background:#10b9811a}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ExchangeCards.js",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_s(ExchangeCards, "bpx/AqB5gD20n129vvb4uS/nUOU=");
_c = ExchangeCards;
var _c;
__turbopack_context__.k.register(_c, "ExchangeCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/ipfsUtils.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getCardImageUrl",
    ()=>getCardImageUrl,
    "getCardMetadata",
    ()=>getCardMetadata,
    "getFullCardData",
    ()=>getFullCardData,
    "getIPFSHashForCard",
    ()=>getIPFSHashForCard,
    "getIPFSUrl",
    ()=>getIPFSUrl,
    "getRandomIPFSHash",
    ()=>getRandomIPFSHash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [client] (ecmascript)");
// Import des hashes IPFS depuis le frontend
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/public/ipfs-hashes.json (json)");
;
;
const getIPFSUrl = (hash)=>{
    if (!hash) return '';
    // Supprimer le préfixe ipfs:// si présent
    const cleanHash = hash.replace('ipfs://', '');
    return `${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__["IPFS_GATEWAY"]}${cleanHash}`;
};
const getCardMetadata = async (ipfsHash)=>{
    try {
        const url = getIPFSUrl(ipfsHash);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des métadonnées');
        }
        const metadata = await response.json();
        return metadata;
    } catch (error) {
        console.error('Erreur métadonnées IPFS:', error);
        return null;
    }
};
const getIPFSHashForCard = (race, rarity)=>{
    try {
        const raceName = race.toLowerCase();
        const rarityName = rarity.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName] && __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName][rarityName]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName][rarityName].metadataHash;
        }
        return null;
    } catch (error) {
        console.error('Erreur récupération hash IPFS:', error);
        return null;
    }
};
const getCardImageUrl = (race, rarity)=>{
    try {
        const raceName = race.toLowerCase();
        const rarityName = rarity.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName] && __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName][rarityName]) {
            const imageHash = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][raceName][rarityName].imageHash;
            return getIPFSUrl(imageHash);
        }
        return '/images/card-placeholder.png';
    } catch (error) {
        console.error('Erreur récupération image:', error);
        return '/images/card-placeholder.png';
    }
};
const getFullCardData = async (card)=>{
    try {
        const imageUrl = getCardImageUrl(card.race, card.rarity);
        const metadata = await getCardMetadata(card.ipfsHash);
        return {
            ...card,
            imageUrl,
            metadata
        };
    } catch (error) {
        console.error('Erreur récupération données carte:', error);
        return card;
    }
};
const getRandomIPFSHash = ()=>{
    const races = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"]);
    const rarities = [
        'common',
        'rare',
        'epic',
        'legendary'
    ];
    // Sélection aléatoire (pour simulation, le vrai random sera fait par VRF)
    const randomRace = races[Math.floor(Math.random() * races.length)];
    const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
    return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][randomRace][randomRarity].metadataHash;
};
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/FuseCards.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FuseCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$ipfsUtils$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/ipfsUtils.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function FuseCards({ userCards, onFuseSuccess }) {
    _s();
    const [selectedCards, setSelectedCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isFusing, setIsFusing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleCardSelect = (card)=>{
        if (selectedCards.find((c)=>c.tokenId === card.tokenId)) {
            setSelectedCards(selectedCards.filter((c)=>c.tokenId !== card.tokenId));
        } else if (selectedCards.length < 3) {
            setSelectedCards([
                ...selectedCards,
                card
            ]);
        }
    };
    const handleFuse = async ()=>{
        if (selectedCards.length !== 3) {
            setError('Sélectionnez exactement 3 cartes');
            return;
        }
        setIsFusing(true);
        setError('');
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getContract"])();
            const ipfsHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$ipfsUtils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["getRandomIPFSHash"])();
            if (!ipfsHash || ipfsHash.trim().length === 0) {
                setError("Erreur: Hash IPFS invalide");
                setIsFusing(false);
                return;
            }
            const tokenIds = selectedCards.map((card)=>card.tokenId);
            const tx = await contract.fuse(tokenIds, ipfsHash);
            setSuccess('⏳ Fusion en cours...');
            await tx.wait();
            setSuccess('✅ Fusion réussie !');
            setSelectedCards([]);
            if (onFuseSuccess) setTimeout(()=>onFuseSuccess(), 2000);
        } catch (error) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$client$5d$__$28$ecmascript$29$__["handleTransactionError"])(error));
        } finally{
            setIsFusing(false);
        }
    };
    const fusionableCards = (userCards || []).filter((card)=>{
        const now = Math.floor(Date.now() / 1000);
        return (!card.isLocked || card.lockUntil <= now) && card.rarity < 3;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-ad9e446f5ee62245" + " " + "fuse-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "jsx-ad9e446f5ee62245",
                children: "⚗️ Fusionner des Cartes"
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "jsx-ad9e446f5ee62245",
                children: "Combinez 3 cartes de même rareté pour créer 1 carte supérieure"
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "selection-counter",
                children: [
                    "Sélectionnées: ",
                    selectedCards.length,
                    "/3"
                ]
            }, void 0, true, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "cards-grid",
                children: fusionableCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        card: card,
                        onSelect: ()=>handleCardSelect(card),
                        isSelected: selectedCards.find((c)=>c.tokenId === card.tokenId) !== undefined
                    }, card.tokenId, false, {
                        fileName: "[project]/components/FuseCards.js",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            selectedCards.length === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleFuse,
                disabled: isFusing,
                className: "jsx-ad9e446f5ee62245" + " " + "btn-fuse",
                children: isFusing ? 'Fusion...' : 'Fusionner'
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 82,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 87,
                columnNumber: 17
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 88,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ad9e446f5ee62245",
                children: ".fuse-container.jsx-ad9e446f5ee62245{max-width:1200px;margin:0 auto}.selection-counter.jsx-ad9e446f5ee62245{text-align:center;background:#ffffff0d;border-radius:8px;margin:1rem 0;padding:1rem}.cards-grid.jsx-ad9e446f5ee62245{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin:2rem 0;display:grid}.btn-fuse.jsx-ad9e446f5ee62245{color:#fff;cursor:pointer;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:12px;width:100%;padding:1.5rem;font-size:1.25rem;font-weight:700}.alert.jsx-ad9e446f5ee62245{text-align:center;border-radius:8px;margin-top:1rem;padding:1rem}.alert-error.jsx-ad9e446f5ee62245{color:#ef4444;background:#ef44441a}.alert-success.jsx-ad9e446f5ee62245{color:#10b981;background:#10b9811a}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/FuseCards.js",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(FuseCards, "IPUiZEbBAr5LAQGgKKKggY8Hi8Y=");
_c = FuseCards;
var _c;
__turbopack_context__.k.register(_c, "FuseCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WalletConnect.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MintCard.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MyCards.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExchangeCards.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FuseCards.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
function Home() {
    _s();
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('mint');
    const [refreshTrigger, setRefreshTrigger] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const handleAccountChange = (newAccount)=>{
        setAccount(newAccount);
        // Reset à l'onglet Mint quand le compte change
        if (newAccount === null) {
            setActiveTab('mint');
            setRefreshTrigger(0);
        }
    };
    const triggerRefresh = ()=>{
        setRefreshTrigger((prev)=>prev + 1);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Andromeda Protocol - Space Card Collection Game"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Decentralized space card collecting game on Ethereum"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-content",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "title",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "logo",
                                        children: "🌌"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 39,
                                        columnNumber: 13
                                    }, this),
                                    "Andromeda Protocol"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "subtitle",
                                children: "Decentralized Space Card Collection Game"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-wallet",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            onConnect: handleAccountChange
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "navigation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'mint' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('mint'),
                        children: "🎲 Mint"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'collection' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('collection'),
                        children: "🎴 Ma Collection"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'exchange' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('exchange'),
                        children: "🔄 Échanger"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'fuse' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('fuse'),
                        children: "⚡ Fusionner"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 51,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "main",
                children: !account ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "welcome-screen",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "welcome-content",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "🚀 Bienvenue dans l'Andromeda Protocol"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 84,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Collectionnez, échangez et fusionnez des cartes spatiales représentant les vaisseaux de 7 civilisations aliens à travers 4 niveaux de rareté."
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 85,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "features",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "🎲"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 91,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "Mint Aléatoire"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 92,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Utilisez Chainlink VRF pour un tirage équitable"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 93,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 90,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "🔄"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 96,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "Échanges P2P"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 97,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Tradez directement avec d'autres commandants"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 98,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "⚡"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 101,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "Fusion de Cartes"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 102,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Combinez 3 cartes pour une rareté supérieure"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 103,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 100,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 89,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "cta-text",
                                children: "Connectez votre wallet Metamask pour commencer"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 106,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 83,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 82,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "content-area",
                    children: [
                        activeTab === 'mint' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            onMintSuccess: triggerRefresh
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 114,
                            columnNumber: 15
                        }, this),
                        activeTab === 'collection' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            refreshTrigger: refreshTrigger
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 117,
                            columnNumber: 15
                        }, this),
                        activeTab === 'exchange' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            account: account
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 120,
                            columnNumber: 15
                        }, this),
                        activeTab === 'fuse' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            onFuseSuccess: triggerRefresh
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 123,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 112,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "footer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "footer-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: [
                                "Andromeda Protocol © 2026 |",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "https://sepolia.etherscan.io/address/0x317Fbed8fD8491B080f98A8e3540A6cb190908d7",
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    children: "Contrat sur Sepolia"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "team-info",
                            children: "Développé par: Jorelle Alice ETOUNDI (Smart Contracts) | Emmanuel AKA (Backend) | Arsel DIFFO (Frontend)"
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 131,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 130,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/index.js",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(Home, "9lgBL43qMSyqAOkNmo7u7ITAl1w=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__c7be17f7._.js.map