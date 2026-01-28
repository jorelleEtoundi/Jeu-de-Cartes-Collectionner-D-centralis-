module.exports = [
"[project]/utils/contractConfig.js [ssr] (ecmascript)", ((__turbopack_context__) => {
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
        "https://rpc.sepolia.org"
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
}),
"[project]/contracts/AndromedaProtocol.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_vrfCoordinator\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_linkToken\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"_keyHash\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"ERC721EnumerableForbiddenBatchMint\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721IncorrectOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721InsufficientApproval\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"approver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidApprover\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOperator\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidReceiver\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"ERC721InvalidSender\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721NonexistentToken\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"ERC721OutOfBoundsIndex\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"OwnableInvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"OwnableUnauthorizedAccount\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"approved\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"name\":\"CardLocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"}],\"name\":\"CardMinted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"CardUnlocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"token1\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"token2\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"initiator\",\"type\":\"address\"}],\"name\":\"CardsExchanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"burnedTokens\",\"type\":\"uint256[]\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"newTokenId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"newRarity\",\"type\":\"uint8\"}],\"name\":\"CardsFused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"LOCK_DURATION\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_CARDS_PER_OWNER\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"TRANSACTION_COOLDOWN\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"VRF_FEE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"}],\"name\":\"canTransact\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"cards\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"ipfsHash\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"createdAt\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lastTransferAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isLocked\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"myTokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"otherOwner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"otherTokenId\",\"type\":\"uint256\"}],\"name\":\"exchange\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[3]\",\"name\":\"tokenIds\",\"type\":\"uint256[3]\"},{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"}],\"name\":\"fuse\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getApproved\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getCard\",\"outputs\":[{\"components\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"enum AndromedaProtocol.Race\",\"name\":\"race\",\"type\":\"uint8\"},{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"rarity\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"ipfsHash\",\"type\":\"string\"},{\"internalType\":\"address[]\",\"name\":\"previousOwners\",\"type\":\"address[]\"},{\"internalType\":\"uint256\",\"name\":\"createdAt\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lastTransferAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isLocked\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"lockUntil\",\"type\":\"uint256\"}],\"internalType\":\"struct AndromedaProtocol.Card\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"}],\"name\":\"getUserCards\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"isCardLocked\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"lastTransactionTime\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"requestId\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ownerOf\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"pendingMintHashes\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"enum AndromedaProtocol.Rarity\",\"name\":\"\",\"type\":\"uint8\"}],\"name\":\"rarityValues\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"requestId\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"randomness\",\"type\":\"uint256\"}],\"name\":\"rawFulfillRandomness\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"_ipfsHash\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"randomness\",\"type\":\"uint256\"}],\"name\":\"testMint\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"tokenByIndex\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"tokenOfOwnerByIndex\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"tokenURI\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"vrfRequests\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]"));}),
"[project]/utils/web3Utils.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__ = __turbopack_context__.i("[externals]/ethers [external] (ethers, esm_import, [project]/node_modules/ethers)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/contractConfig.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/contracts/AndromedaProtocol.json (json)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const isMetamaskInstalled = ()=>{
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && typeof window.ethereum !== 'undefined';
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
        const chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });
        if (chainId !== __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId) {
            try {
                console.log(`Changement de réseau vers ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}...`);
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [
                        {
                            chainId: __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId
                        }
                    ]
                });
                console.log(`✓ Réseau changé vers ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}`);
            } catch (switchError) {
                // Si le réseau n'existe pas, on l'ajoute
                if (switchError.code === 4902) {
                    console.log(`Réseau ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName} non trouvé. Ajout du réseau...`);
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"]
                            ]
                        });
                        console.log(`✓ Réseau ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName} ajouté et activé`);
                    } catch (addError) {
                        console.error("Erreur lors de l'ajout du réseau:", addError);
                        throw new Error(`Impossible d'ajouter ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}. Veuillez l'ajouter manuellement dans Metamask.`);
                    }
                } else if (switchError.code === 4001) {
                    // Utilisateur a refusé
                    throw new Error("Vous devez accepter le changement de réseau pour continuer.");
                } else {
                    throw switchError;
                }
            }
        } else {
            console.log(`✓ Déjà connecté à ${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainName}`);
        }
    } catch (error) {
        console.error("Erreur lors du changement de réseau:", error);
        throw error;
    }
};
const setupNetworkListener = ()=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
};
const getProvider = ()=>{
    if (!isMetamaskInstalled()) {
        throw new Error("Metamask n'est pas installé");
    }
    return new __TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__["ethers"].BrowserProvider(window.ethereum);
};
const getSigner = async ()=>{
    const provider = getProvider();
    return await provider.getSigner();
};
const getContract = async ()=>{
    const signer = await getSigner();
    return new __TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__["ethers"].Contract(__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["CONTRACT_ADDRESS"], __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__["default"], signer);
};
const getContractReadOnly = ()=>{
    const provider = getProvider();
    return new __TURBOPACK__imported__module__$5b$externals$5d2f$ethers__$5b$external$5d$__$28$ethers$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ethers$29$__["ethers"].Contract(__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["CONTRACT_ADDRESS"], __TURBOPACK__imported__module__$5b$project$5d2f$contracts$2f$AndromedaProtocol$2e$json__$28$json$29$__["default"], provider);
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/WalletConnect.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>WalletConnect
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function WalletConnect({ onConnect }) {
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const isDisconnectingRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!mounted) return;
        // Vérifier si déjà connecté au chargement
        checkConnection();
        // Mettre en place les listeners de réseau et compte
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["setupNetworkListener"])();
        // Écouter les changements de compte
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        };
    }, [
        mounted
    ]);
    const checkConnection = async ()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) return;
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
            setAccount(null);
            if (onConnect) onConnect(null);
            setShowMenu(false);
        } else {
            setAccount(accounts[0]);
            if (onConnect) onConnect(accounts[0]);
            setShowMenu(false);
        }
    };
    const handleConnect = async ()=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) {
            setError("Metamask n'est pas installé. Installez-le sur metamask.io");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const connectedAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["connectWallet"])();
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "wallet-connect",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                className: "btn btn-connect",
                disabled: true,
                children: "Chargement..."
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 101,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 100,
            columnNumber: 7
        }, this);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["isMetamaskInstalled"])()) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "wallet-connect",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "alert alert-warning",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: "⚠️ Metamask requis"
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: "Vous devez installer Metamask pour utiliser cette application."
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                        href: "https://metamask.io/download/",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "btn btn-primary",
                        children: "Installer Metamask"
                    }, void 0, false, {
                        fileName: "[project]/components/WalletConnect.js",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 111,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 110,
            columnNumber: 7
        }, this);
    }
    if (account) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "wallet-connected",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "account-info",
                    onClick: ()=>setShowMenu(!showMenu),
                    style: {
                        cursor: 'pointer',
                        position: 'relative'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "status-indicator connected"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "account-address",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatAddress"])(account)
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                marginLeft: '8px',
                                fontSize: '0.8rem'
                            },
                            children: "▼"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WalletConnect.js",
                    lineNumber: 130,
                    columnNumber: 9
                }, this),
                showMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "wallet-menu",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-header",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)'
                                },
                                children: "Compte connecté"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.js",
                                lineNumber: 143,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 142,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-account",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "status-indicator connected",
                                    style: {
                                        marginRight: '8px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/WalletConnect.js",
                                    lineNumber: 146,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                wordBreak: 'break-all'
                                            },
                                            children: account
                                        }, void 0, false, {
                                            fileName: "[project]/components/WalletConnect.js",
                                            lineNumber: 148,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '0.8rem',
                                                color: 'var(--success)',
                                                marginTop: '4px'
                                            },
                                            children: "✓ Connecté"
                                        }, void 0, false, {
                                            fileName: "[project]/components/WalletConnect.js",
                                            lineNumber: 151,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/WalletConnect.js",
                                    lineNumber: 147,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 145,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "wallet-menu-divider"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleDisconnect,
                            className: "wallet-menu-item",
                            style: {
                                color: 'var(--error)'
                            },
                            children: "🚪 Déconnecter"
                        }, void 0, false, {
                            fileName: "[project]/components/WalletConnect.js",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WalletConnect.js",
                    lineNumber: 141,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/WalletConnect.js",
            lineNumber: 129,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "wallet-connect",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: handleConnect,
                disabled: loading,
                className: "btn btn-connect",
                children: loading ? 'Connexion...' : '🦊 Connecter Metamask'
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.js",
                lineNumber: 180,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/WalletConnect.js",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/public/ipfs-hashes.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"humans":{"common":{"imageHash":"QmYDMUnwA22TPrdEnvDjKYGFwAXUe5X8U4wXW4jPUVwj3b","metadataHash":"QmP5zLW2PNdAAYa3EDMzjE9peCKQiw43uXjKtCFc4cjRYK","imageUrl":"ipfs://QmYDMUnwA22TPrdEnvDjKYGFwAXUe5X8U4wXW4jPUVwj3b","metadataUrl":"ipfs://QmP5zLW2PNdAAYa3EDMzjE9peCKQiw43uXjKtCFc4cjRYK"},"rare":{"imageHash":"QmXPA1KVWbpDRevkegSQbVPNkbUyuxmpgmnJ3VthYKaM9T","metadataHash":"QmTcQzQAMKUmBaGWAj7ncKHHiXLwMNevc7SdahF6AaQtKc","imageUrl":"ipfs://QmXPA1KVWbpDRevkegSQbVPNkbUyuxmpgmnJ3VthYKaM9T","metadataUrl":"ipfs://QmTcQzQAMKUmBaGWAj7ncKHHiXLwMNevc7SdahF6AaQtKc"},"epic":{"imageHash":"QmZWCK8xYtsNJXv3vDWxqNvHo2EVsW2Pdifc6cciVSj3b8","metadataHash":"QmWwLc1tPdX6M9NyYFDVgxdDxxcbHjCLTb57MZ22EoVuAU","imageUrl":"ipfs://QmZWCK8xYtsNJXv3vDWxqNvHo2EVsW2Pdifc6cciVSj3b8","metadataUrl":"ipfs://QmWwLc1tPdX6M9NyYFDVgxdDxxcbHjCLTb57MZ22EoVuAU"},"legendary":{"imageHash":"QmUjJSHzfBow5yTf87KiFch5LMWohNnNkjqjoy6Bn8mDBM","metadataHash":"QmVHgJSJibkka1xEU1a5Ypj2CWu2QJHFfRbFjjykDwsVJz","imageUrl":"ipfs://QmUjJSHzfBow5yTf87KiFch5LMWohNnNkjqjoy6Bn8mDBM","metadataUrl":"ipfs://QmVHgJSJibkka1xEU1a5Ypj2CWu2QJHFfRbFjjykDwsVJz"}},"zephyrs":{"common":{"imageHash":"QmeBwAo6DisFLLfR3SnCuB87iAqGy6hXTsUQmS17dH3cSX","metadataHash":"QmQffQC3HTAVKtzfe5fWwqeKYDC93rDV1WLQcPwJzRwXLD","imageUrl":"ipfs://QmeBwAo6DisFLLfR3SnCuB87iAqGy6hXTsUQmS17dH3cSX","metadataUrl":"ipfs://QmQffQC3HTAVKtzfe5fWwqeKYDC93rDV1WLQcPwJzRwXLD"},"rare":{"imageHash":"QmQ8FEME4EaMczYs7P8MLpihLmqavomn97ChoEHRSVgasH","metadataHash":"Qme1sfwL8jvzDJVgJkcj7vvDHeF3LCCPSBYMa5mfED3yJq","imageUrl":"ipfs://QmQ8FEME4EaMczYs7P8MLpihLmqavomn97ChoEHRSVgasH","metadataUrl":"ipfs://Qme1sfwL8jvzDJVgJkcj7vvDHeF3LCCPSBYMa5mfED3yJq"},"epic":{"imageHash":"QmYCJDNDC3da5nhF9rukrd3FXw23bgMqbuy9qNnfqQaMXZ","metadataHash":"QmXs1JLLiERPuqNjbu9Z3CBHk9Wra3qxr4qJUNokuEQEGt","imageUrl":"ipfs://QmYCJDNDC3da5nhF9rukrd3FXw23bgMqbuy9qNnfqQaMXZ","metadataUrl":"ipfs://QmXs1JLLiERPuqNjbu9Z3CBHk9Wra3qxr4qJUNokuEQEGt"},"legendary":{"imageHash":"QmXRhhE3PKufajwuhACH4mdChzZMkSSeBfZ2pkoEfCa1Jg","metadataHash":"QmcGgEGisN85TuWfcXLKEALG7n7Z1nda162G2m6YBzjrcB","imageUrl":"ipfs://QmXRhhE3PKufajwuhACH4mdChzZMkSSeBfZ2pkoEfCa1Jg","metadataUrl":"ipfs://QmcGgEGisN85TuWfcXLKEALG7n7Z1nda162G2m6YBzjrcB"}},"kraths":{"common":{"imageHash":"QmU8W4GQHm6FMkarR7oFebreVhYjUj1eS1PG7H1SPokNVd","metadataHash":"Qmaaoydink9QvC2vhjcCNFnakCivCFkg1ZkSMCS93ryEGa","imageUrl":"ipfs://QmU8W4GQHm6FMkarR7oFebreVhYjUj1eS1PG7H1SPokNVd","metadataUrl":"ipfs://Qmaaoydink9QvC2vhjcCNFnakCivCFkg1ZkSMCS93ryEGa"},"rare":{"imageHash":"QmUCDkWbpefXX5NADCCL2RPPvM9LxwGNNX1mveKzGuG9wE","metadataHash":"QmSZCiyA4mCQ1iY8AP9271ekRMFy15DSnpuqxNhzYHMZt4","imageUrl":"ipfs://QmUCDkWbpefXX5NADCCL2RPPvM9LxwGNNX1mveKzGuG9wE","metadataUrl":"ipfs://QmSZCiyA4mCQ1iY8AP9271ekRMFy15DSnpuqxNhzYHMZt4"},"epic":{"imageHash":"QmX3xuKXHstoCc2hB3Bqgm3j1SyGAXTptRm1MQDirWrm5G","metadataHash":"QmSN3aVt4Z9B1CstaQd3CS462mfbnuvcnCt74MMHvNqKxC","imageUrl":"ipfs://QmX3xuKXHstoCc2hB3Bqgm3j1SyGAXTptRm1MQDirWrm5G","metadataUrl":"ipfs://QmSN3aVt4Z9B1CstaQd3CS462mfbnuvcnCt74MMHvNqKxC"},"legendary":{"imageHash":"QmYcXz1k4rTNny5ReoQ1APHRApVfAoZ4JSf7NLorXNqea3","metadataHash":"QmXdS7CWeN7Jt83GXqat5nSrKc7XRYABBVseCxtHxVsiDu","imageUrl":"ipfs://QmYcXz1k4rTNny5ReoQ1APHRApVfAoZ4JSf7NLorXNqea3","metadataUrl":"ipfs://QmXdS7CWeN7Jt83GXqat5nSrKc7XRYABBVseCxtHxVsiDu"}},"preservers":{"common":{"imageHash":"QmYBuQR893WJiGta2LPXLe1mJJnrz3Ez2m2JYHCJGX1URC","metadataHash":"QmZ22ZxZoAGJ4ZTb5zqvQzkFEEso17LXeTZXu3MGw1ads6","imageUrl":"ipfs://QmYBuQR893WJiGta2LPXLe1mJJnrz3Ez2m2JYHCJGX1URC","metadataUrl":"ipfs://QmZ22ZxZoAGJ4ZTb5zqvQzkFEEso17LXeTZXu3MGw1ads6"},"rare":{"imageHash":"QmSfUdUqzJG8NjF3KeitnXK8VxUK1rVTDsnjVLHAizkefF","metadataHash":"QmYTa7Gn8NzuzgDgxdXCWFn4EvcUsMnH3ErUagaF2F8PXE","imageUrl":"ipfs://QmSfUdUqzJG8NjF3KeitnXK8VxUK1rVTDsnjVLHAizkefF","metadataUrl":"ipfs://QmYTa7Gn8NzuzgDgxdXCWFn4EvcUsMnH3ErUagaF2F8PXE"},"epic":{"imageHash":"QmTGDg3rzRsBKNcvQYSmTXFu9P1ZFTN6dpTMBMiaQ5YHts","metadataHash":"QmV4C3MteDHoQFVz1VfLpay9GqtcteUwTze962bf9wU4B9","imageUrl":"ipfs://QmTGDg3rzRsBKNcvQYSmTXFu9P1ZFTN6dpTMBMiaQ5YHts","metadataUrl":"ipfs://QmV4C3MteDHoQFVz1VfLpay9GqtcteUwTze962bf9wU4B9"},"legendary":{"imageHash":"QmeGZYCayTH5rfqMDkBGHQ5HMnfJLmYmwWxLFq5DBU5K5u","metadataHash":"QmcntUeqHBN8h86yB8HNz8x8ugaTxX7KCqvRrY3QFxfZw2","imageUrl":"ipfs://QmeGZYCayTH5rfqMDkBGHQ5HMnfJLmYmwWxLFq5DBU5K5u","metadataUrl":"ipfs://QmcntUeqHBN8h86yB8HNz8x8ugaTxX7KCqvRrY3QFxfZw2"}},"synthetics":{"common":{"imageHash":"QmNh6wy28phqgxKyjyxpFxbeGPUBLCTByKeGwkEtRBaNKu","metadataHash":"QmPcKDYMczA3bwHC4zPtefoJ9SFUSfcX6y9Cv2FyxLoFtb","imageUrl":"ipfs://QmNh6wy28phqgxKyjyxpFxbeGPUBLCTByKeGwkEtRBaNKu","metadataUrl":"ipfs://QmPcKDYMczA3bwHC4zPtefoJ9SFUSfcX6y9Cv2FyxLoFtb"},"rare":{"imageHash":"QmPDmvHhrRtF5q8oMmSJbqnAEewq8BVLUsKBfEVxBW2fKi","metadataHash":"QmVrRsyt2eace3Qgs1HS5Jjupjujp5f7rusWiCfBj21VXf","imageUrl":"ipfs://QmPDmvHhrRtF5q8oMmSJbqnAEewq8BVLUsKBfEVxBW2fKi","metadataUrl":"ipfs://QmVrRsyt2eace3Qgs1HS5Jjupjujp5f7rusWiCfBj21VXf"},"epic":{"imageHash":"QmZ7kbm9pEkhy8ygMaUpti4n8H8aMtYCgjn6wWMdCoZfsq","metadataHash":"QmWap5U2wHrVoS3XirjxjgfPWwkrLEwz8KPeJagXArQkjp","imageUrl":"ipfs://QmZ7kbm9pEkhy8ygMaUpti4n8H8aMtYCgjn6wWMdCoZfsq","metadataUrl":"ipfs://QmWap5U2wHrVoS3XirjxjgfPWwkrLEwz8KPeJagXArQkjp"},"legendary":{"imageHash":"QmernB1cRTKbtBEfJR1WcAxiQDTdP4JJEE9AFNAnJp4Jk2","metadataHash":"QmYRJMFwkrmMSAxsmdWknADq5jb3uJu1EAALvXSkpmFJv6","imageUrl":"ipfs://QmernB1cRTKbtBEfJR1WcAxiQDTdP4JJEE9AFNAnJp4Jk2","metadataUrl":"ipfs://QmYRJMFwkrmMSAxsmdWknADq5jb3uJu1EAALvXSkpmFJv6"}},"aquarians":{"common":{"imageHash":"QmQKetGKgcfUtubvTjMnwk4vp1nqNpgDTR31Jz1CrTqejE","metadataHash":"Qmd58izNNSNNCyyEwNXRXTWTjC5YbEfyfvtapqcVDe1zXY","imageUrl":"ipfs://QmQKetGKgcfUtubvTjMnwk4vp1nqNpgDTR31Jz1CrTqejE","metadataUrl":"ipfs://Qmd58izNNSNNCyyEwNXRXTWTjC5YbEfyfvtapqcVDe1zXY"},"rare":{"imageHash":"QmYfXsZ7B5HFHWzD1Nef94NNC2DEPbB2kYxe5rzihuP3q5","metadataHash":"QmXDFQcizgzHEZ8U91WmUF19WhJAX383avSJnhmPQFGVc1","imageUrl":"ipfs://QmYfXsZ7B5HFHWzD1Nef94NNC2DEPbB2kYxe5rzihuP3q5","metadataUrl":"ipfs://QmXDFQcizgzHEZ8U91WmUF19WhJAX383avSJnhmPQFGVc1"},"epic":{"imageHash":"QmaV4RiqKbbwT7L4TLDMhABP3n3hff6Db3FGQwDmx83Qqb","metadataHash":"QmWBgRFwBZYitJiqV4MB5s47gA3hXJ6nmYd2vhy8c6yEgX","imageUrl":"ipfs://QmaV4RiqKbbwT7L4TLDMhABP3n3hff6Db3FGQwDmx83Qqb","metadataUrl":"ipfs://QmWBgRFwBZYitJiqV4MB5s47gA3hXJ6nmYd2vhy8c6yEgX"},"legendary":{"imageHash":"QmdacRScpyJtH1uohR5Q9opE1ohSTbxWwACMyjP446MxdU","metadataHash":"QmStnevno7LefbMhE7fkSQGiJ21aD6tL9vcaFKWpfFsmoa","imageUrl":"ipfs://QmdacRScpyJtH1uohR5Q9opE1ohSTbxWwACMyjP446MxdU","metadataUrl":"ipfs://QmStnevno7LefbMhE7fkSQGiJ21aD6tL9vcaFKWpfFsmoa"}},"ancients":{"common":{"imageHash":"QmcbNm17So8VuVV7cq3PoocJnhdqZAAPmSA2VFmHGMZX8y","metadataHash":"QmSL6dQ7HxRMzJrHRUnK593Nu2TwwqrpjGNKUXxP1svG42","imageUrl":"ipfs://QmcbNm17So8VuVV7cq3PoocJnhdqZAAPmSA2VFmHGMZX8y","metadataUrl":"ipfs://QmSL6dQ7HxRMzJrHRUnK593Nu2TwwqrpjGNKUXxP1svG42"},"rare":{"imageHash":"QmQFfsxDBfacCArd43x284rqXBx25CJ6qfnc29zMEVS7yZ","metadataHash":"QmXGwK78ZgXByD15DgiiBT2mGt7NU5dP59WoBfYD4hbsnE","imageUrl":"ipfs://QmQFfsxDBfacCArd43x284rqXBx25CJ6qfnc29zMEVS7yZ","metadataUrl":"ipfs://QmXGwK78ZgXByD15DgiiBT2mGt7NU5dP59WoBfYD4hbsnE"},"epic":{"imageHash":"Qme3a4PEBgFrMZv8KPV8s1J5mBF6uWdn2Hc35orraVUi9w","metadataHash":"QmXGrhNhavhcVWcHkmiBQ4HsK9vXbhESLLSqDbcWiwKLCm","imageUrl":"ipfs://Qme3a4PEBgFrMZv8KPV8s1J5mBF6uWdn2Hc35orraVUi9w","metadataUrl":"ipfs://QmXGrhNhavhcVWcHkmiBQ4HsK9vXbhESLLSqDbcWiwKLCm"},"legendary":{"imageHash":"Qme8v7yePNJx1ts7QRAetffyTiZWPi3gBW3iP9iaQyVyvn","metadataHash":"QmSk9V3E9bLrsDTfvcPuDxnftxUpP54ZgTbLZFrBiJmwR8","imageUrl":"ipfs://Qme8v7yePNJx1ts7QRAetffyTiZWPi3gBW3iP9iaQyVyvn","metadataUrl":"ipfs://QmSk9V3E9bLrsDTfvcPuDxnftxUpP54ZgTbLZFrBiJmwR8"}}});}),
"[project]/components/MintCard.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>MintCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/public/ipfs-hashes.json (json)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function MintCard({ account, onMintSuccess }) {
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [cooldown, setCooldown] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [cardBalance, setCardBalance] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [useTestMint, setUseTestMint] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true); // Mode test par défaut
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (account) {
            checkCooldownAndBalance();
        }
    }, [
        account
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (cooldown > 0) {
            const timer = setInterval(()=>{
                setCooldown((prev)=>prev > 0 ? prev - 1 : 0);
            }, 1000);
            return ()=>clearInterval(timer);
        }
    }, [
        cooldown
    ]);
    const checkCooldownAndBalance = async ()=>{
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__["default"][randomRace][rarity].metadataHash;
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
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
            const ipfsHash = getRandomIPFSHash();
            // S'assurer que le hash est une chaîne valide
            if (!ipfsHash || ipfsHash.trim().length === 0) {
                setError("Erreur: Hash IPFS invalide");
                setLoading(false);
                return;
            }
            let tx;
            if (useTestMint) {
                // Utiliser testMint pour les tests (ne nécessite pas VRF)
                const randomness = Math.floor(Math.random() * 1000000);
                tx = await contract.testMint(ipfsHash, randomness);
                setSuccess("Transaction envoyée en mode TEST! En attente de confirmation...");
            } else {
                // Utiliser mint normal (nécessite VRF)
                tx = await contract.mint(ipfsHash);
                setSuccess("Transaction envoyée! En attente de confirmation...");
            }
            // Attendre la confirmation
            const receipt = await tx.wait();
            setSuccess("🎉 Carte mintée avec succès! ID: " + receipt.logs[0]?.topics[3]);
            // Rafraîchir les données
            await checkCooldownAndBalance();
            if (onMintSuccess) {
                onMintSuccess();
            }
        } catch (error) {
            console.error("Erreur détaillée:", {
                message: error.message,
                code: error.code,
                data: error.data,
                transaction: error.transaction,
                reason: error.reason
            });
            // Messages d'erreur personnalisés
            if (error.message.includes("Fleet is full")) {
                setError("Votre flotte est pleine (10 cartes max)");
            } else if (error.message.includes("Cooldown active")) {
                setError("Cooldown actif. Attendez 5 minutes entre chaque transaction.");
            } else if (error.message.includes("Not enough LINK")) {
                setError("Pas assez de LINK dans le contrat. Contactez l'administrateur.");
            } else if (error.message.includes("user rejected")) {
                setError("Transaction rejetée par l'utilisateur");
            } else if (error.code === "CALL_EXCEPTION") {
                setError("❌ Erreur du contrat. Vérifiez que:\n- Vous êtes connecté au réseau Sepolia\n- Le contrat a assez de LINK\n- Vous respectez le cooldown");
            } else {
                setError(error.message || "Erreur lors du mint");
            }
        } finally{
            setLoading(false);
        }
    };
    const formatCooldown = (seconds)=>{
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "mint-card-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "section-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        children: "🚀 Minter une nouvelle carte"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: "Créez une carte spatiale aléatoire avec Chainlink VRF"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mint-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "info-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "label",
                                children: "Vos cartes:"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "value",
                                children: [
                                    cardBalance,
                                    " / 10"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "info-item",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "label",
                                children: "Cooldown:"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "value",
                                children: cooldown > 0 ? formatCooldown(cooldown) : "✅ Disponible"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 165,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: handleMint,
                disabled: loading || cooldown > 0 || cardBalance >= 10 || !account,
                className: "btn btn-mint",
                children: loading ? "Mint en cours..." : "🎲 Minter une carte"
            }, void 0, false, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '15px',
                    padding: '10px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: useTestMint,
                                onChange: (e)=>setUseTestMint(e.target.checked),
                                style: {
                                    cursor: 'pointer'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.9rem'
                                },
                                children: useTestMint ? '🧪 Mode TEST (testMint)' : '⚙️ Mode VRF (mint)'
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginTop: '4px'
                        },
                        children: useTestMint ? 'Utilise testMint - Pas de VRF requis (recommandé pour tester)' : 'Utilise mint avec VRF - Nécessite LINK dans le contrat'
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "alert alert-error",
                children: [
                    "❌ ",
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 199,
                columnNumber: 9
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 205,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mint-details",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: "Probabilités de rareté:"
                    }, void 0, false, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "⚪ Common: 70%"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 213,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "🔵 Rare: 20%"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 214,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "🟣 Epic: 8%"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 215,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                children: "🟡 Legendary: 2%"
                            }, void 0, false, {
                                fileName: "[project]/components/MintCard.js",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MintCard.js",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MintCard.js",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MintCard.js",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/CardDisplay.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>CardDisplay
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/contractConfig.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function CardDisplay({ card, tokenId, onSelect, selected }) {
    if (!card) return null;
    const raceNumber = typeof card.race === 'object' ? card.race._hex ? parseInt(card.race._hex, 16) : card.race : card.race;
    const rarityNumber = typeof card.rarity === 'object' ? card.rarity._hex ? parseInt(card.rarity._hex, 16) : card.rarity : card.rarity;
    const raceName = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["RACE_NAMES"][raceNumber] || 'Unknown';
    const rarityName = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["RARITY_NAMES"][rarityNumber] || 'Unknown';
    const rarityColor = __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["RARITY_COLORS"][rarityNumber] || '#9CA3AF';
    const locked = card.isLocked && (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["isCardLocked"])(card.lockUntil);
    const imageUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getIPFSUrl"])(card.ipfsHash);
    const handleClick = ()=>{
        if (onSelect && !locked) {
            onSelect(tokenId);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: `card-item ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`,
        onClick: handleClick,
        style: {
            borderColor: rarityColor
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "rarity-badge",
                style: {
                    backgroundColor: rarityColor
                },
                children: rarityName
            }, void 0, false, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-image",
                children: imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                    src: imageUrl,
                    alt: card.name
                }, void 0, false, {
                    fileName: "[project]/components/CardDisplay.js",
                    lineNumber: 37,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "card-placeholder",
                    children: "🚀"
                }, void 0, false, {
                    fileName: "[project]/components/CardDisplay.js",
                    lineNumber: 39,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "card-name",
                        children: card.name
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "card-race",
                        children: [
                            "Race: ",
                            raceName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "card-value",
                        children: [
                            "Valeur: ",
                            card.value?.toString() || '0'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "card-id",
                        children: [
                            "Token ID: #",
                            tokenId
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-status",
                children: [
                    locked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        className: "status-locked",
                        children: "🔒 Verrouillée"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this),
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        className: "status-selected",
                        children: "✓ Sélectionnée"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-metadata",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "card-created",
                        children: [
                            "Créée: ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatTimestamp"])(card.createdAt)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    card.lastTransferAt && card.lastTransferAt > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "card-transfer",
                        children: [
                            "Transférée: ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["formatTimestamp"])(card.lastTransferAt)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            card.previousOwners && card.previousOwners.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "card-history",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "history-title",
                        children: "Propriétaires précédents:"
                    }, void 0, false, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "history-count",
                        children: [
                            card.previousOwners.length,
                            " propriétaire(s)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CardDisplay.js",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CardDisplay.js",
                lineNumber: 79,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CardDisplay.js",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/MyCards.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>MyCards
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function MyCards({ account, refreshTrigger }) {
    const [cards, setCards] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (account) {
            loadCards();
        }
    }, [
        account,
        refreshTrigger
    ]);
    const loadCards = async ()=>{
        if (!account) return;
        setLoading(true);
        setError('');
        try {
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
            const balance = await contract.balanceOf(account);
            const balanceNumber = Number(balance);
            if (balanceNumber === 0) {
                setCards([]);
                setLoading(false);
                return;
            }
            // Charger toutes les cartes
            const cardsData = [];
            for(let i = 0; i < balanceNumber; i++){
                try {
                    const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                    const card = await contract.cards(tokenId);
                    cardsData.push({
                        tokenId: Number(tokenId),
                        card: {
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
                        }
                    });
                } catch (err) {
                    console.error(`Erreur lors du chargement de la carte ${i}:`, err);
                }
            }
            setCards(cardsData);
        } catch (error) {
            console.error("Erreur lors du chargement des cartes:", error);
            setError("Impossible de charger vos cartes");
        } finally{
            setLoading(false);
        }
    };
    if (!account) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "alert alert-info",
                children: "Connectez votre wallet pour voir vos cartes"
            }, void 0, false, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 71,
            columnNumber: 7
        }, this);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "loading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "spinner"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: "Chargement de vos cartes..."
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 82,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 81,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "alert alert-error",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/MyCards.js",
                    lineNumber: 93,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: loadCards,
                    className: "btn btn-secondary",
                    children: "Réessayer"
                }, void 0, false, {
                    fileName: "[project]/components/MyCards.js",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 92,
            columnNumber: 7
        }, this);
    }
    if (cards.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "my-cards-section",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "empty-state",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        children: "🚀 Aucune carte pour le moment"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: "Mintez votre première carte pour commencer votre collection!"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 106,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MyCards.js",
            lineNumber: 105,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "my-cards-section",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "section-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        children: "🎴 Ma Collection"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: [
                            "Vous possédez ",
                            cards.length,
                            " carte(s)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: loadCards,
                        className: "btn btn-refresh",
                        children: "🔄 Rafraîchir"
                    }, void 0, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "cards-grid",
                children: cards.map(({ tokenId, card })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        tokenId: tokenId,
                        card: card
                    }, tokenId, false, {
                        fileName: "[project]/components/MyCards.js",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/MyCards.js",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MyCards.js",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[project]/utils/config.js [ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/components/ExchangeCards.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ExchangeCards
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function ExchangeCards({ account, userCards, onExchangeSuccess }) {
    const [selectedMyCard, setSelectedMyCard] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [otherUserAddress, setOtherUserAddress] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [otherUserCards, setOtherUserCards] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [selectedOtherCard, setSelectedOtherCard] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isExchanging, setIsExchanging] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
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
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
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
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
            const tx = await contract.exchange(selectedMyCard.tokenId, otherUserAddress, selectedOtherCard.tokenId);
            setSuccess('⏳ Transaction en cours...');
            await tx.wait();
            setSuccess('✅ Échange réussi !');
            if (onExchangeSuccess) setTimeout(()=>onExchangeSuccess(), 2000);
        } catch (error) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["handleTransactionError"])(error));
        } finally{
            setIsExchanging(false);
        }
    };
    const exchangeableCards = (userCards || []).filter((card)=>{
        const now = Math.floor(Date.now() / 1000);
        return !card.isLocked || card.lockUntil <= now;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "jsx-fb80ac410422e3e1" + " " + "exchange-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                className: "jsx-fb80ac410422e3e1",
                children: "🔄 Échanger des Cartes"
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "1. Votre carte"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-fb80ac410422e3e1" + " " + "cards-grid",
                        children: exchangeableCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "2. Adresse de l'autre utilisateur"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
            otherUserCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "exchange-section",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "jsx-fb80ac410422e3e1",
                        children: "3. Carte à recevoir"
                    }, void 0, false, {
                        fileName: "[project]/components/ExchangeCards.js",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-fb80ac410422e3e1" + " " + "cards-grid",
                        children: otherUserCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            selectedMyCard && selectedOtherCard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: handleExchange,
                disabled: isExchanging,
                className: "jsx-fb80ac410422e3e1" + " " + "btn-exchange",
                children: isExchanging ? 'Échange en cours...' : 'Confirmer l\'échange'
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 140,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 145,
                columnNumber: 17
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-fb80ac410422e3e1" + " " + "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/ExchangeCards.js",
                lineNumber: 146,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/utils/ipfsUtils.js [ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [ssr] (ecmascript)");
// Import des hashes IPFS depuis le frontend
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$ipfs$2d$hashes$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/public/ipfs-hashes.json (json)");
;
;
const getIPFSUrl = (hash)=>{
    if (!hash) return '';
    // Supprimer le préfixe ipfs:// si présent
    const cleanHash = hash.replace('ipfs://', '');
    return `${__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["IPFS_GATEWAY"]}${cleanHash}`;
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
}),
"[project]/components/FuseCards.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>FuseCards
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/web3Utils.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$config$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/config.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$ipfsUtils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/ipfsUtils.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CardDisplay.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function FuseCards({ userCards, onFuseSuccess }) {
    const [selectedCards, setSelectedCards] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [isFusing, setIsFusing] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
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
            const contract = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getContract"])();
            const ipfsHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$ipfsUtils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getRandomIPFSHash"])();
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
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$web3Utils$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["handleTransactionError"])(error));
        } finally{
            setIsFusing(false);
        }
    };
    const fusionableCards = (userCards || []).filter((card)=>{
        const now = Math.floor(Date.now() / 1000);
        return (!card.isLocked || card.lockUntil <= now) && card.rarity < 3;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "jsx-ad9e446f5ee62245" + " " + "fuse-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                className: "jsx-ad9e446f5ee62245",
                children: "⚗️ Fusionner des Cartes"
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "jsx-ad9e446f5ee62245",
                children: "Combinez 3 cartes de même rareté pour créer 1 carte supérieure"
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "cards-grid",
                children: fusionableCards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CardDisplay$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            selectedCards.length === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: handleFuse,
                disabled: isFusing,
                className: "jsx-ad9e446f5ee62245" + " " + "btn-fuse",
                children: isFusing ? 'Fusion...' : 'Fusionner'
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 82,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "alert alert-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 87,
                columnNumber: 17
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-ad9e446f5ee62245" + " " + "alert alert-success",
                children: success
            }, void 0, false, {
                fileName: "[project]/components/FuseCards.js",
                lineNumber: 88,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WalletConnect.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MintCard.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MyCards.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExchangeCards.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FuseCards.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function Home() {
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('mint');
    const [refreshTrigger, setRefreshTrigger] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const handleAccountChange = (newAccount)=>{
        setAccount(newAccount);
    };
    const triggerRefresh = ()=>{
        setRefreshTrigger((prev)=>prev + 1);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        children: "Andromeda Protocol - Space Card Collection Game"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Decentralized space card collecting game on Ethereum"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
                className: "header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "header-content",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                className: "title",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "logo",
                                        children: "🌌"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this),
                                    "Andromeda Protocol"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "subtitle",
                                children: "Decentralized Space Card Collection Game"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "header-wallet",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            onConnect: handleAccountChange
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                className: "navigation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'mint' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('mint'),
                        children: "🎲 Mint"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'collection' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('collection'),
                        children: "🎴 Ma Collection"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'exchange' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('exchange'),
                        children: "🔄 Échanger"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        className: `nav-btn ${activeTab === 'fuse' ? 'active' : ''}`,
                        onClick: ()=>setActiveTab('fuse'),
                        children: "⚡ Fusionner"
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 46,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                className: "main",
                children: !account ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "welcome-screen",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "welcome-content",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                children: "🚀 Bienvenue dans l'Andromeda Protocol"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                children: "Collectionnez, échangez et fusionnez des cartes spatiales représentant les vaisseaux de 7 civilisations aliens à travers 4 niveaux de rareté."
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "features",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "🎲"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 86,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                children: "Mint Aléatoire"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 87,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                children: "Utilisez Chainlink VRF pour un tirage équitable"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.js",
                                        lineNumber: 85,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "🔄"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 91,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                children: "Échanges P2P"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 92,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                children: "Tradez directement avec d'autres commandants"
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "feature",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "feature-icon",
                                                children: "⚡"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 96,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                children: "Fusion de Cartes"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.js",
                                                lineNumber: 97,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                children: "Combinez 3 cartes pour une rareté supérieure"
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
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 84,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "cta-text",
                                children: "Connectez votre wallet Metamask pour commencer"
                            }, void 0, false, {
                                fileName: "[project]/pages/index.js",
                                lineNumber: 101,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 78,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 77,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "content-area",
                    children: [
                        activeTab === 'mint' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MintCard$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            onMintSuccess: triggerRefresh
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 109,
                            columnNumber: 15
                        }, this),
                        activeTab === 'collection' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MyCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            refreshTrigger: refreshTrigger
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 112,
                            columnNumber: 15
                        }, this),
                        activeTab === 'exchange' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExchangeCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            account: account
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 115,
                            columnNumber: 15
                        }, this),
                        activeTab === 'fuse' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FuseCards$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            account: account,
                            onFuseSuccess: triggerRefresh
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 118,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 107,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
                className: "footer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "footer-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "Andromeda Protocol © 2026 |",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                    href: "https://sepolia.etherscan.io/address/0x317Fbed8fD8491B080f98A8e3540A6cb190908d7",
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    children: "Contrat sur Sepolia"
                                }, void 0, false, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "team-info",
                            children: "Développé par: Jorelle Alice ETOUNDI (Smart Contracts) | Emmanuel AKA (Backend) | Arsel DIFFO (Frontend)"
                        }, void 0, false, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/index.js",
                    lineNumber: 126,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.js",
                lineNumber: 125,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/index.js",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__14813ff8._.js.map