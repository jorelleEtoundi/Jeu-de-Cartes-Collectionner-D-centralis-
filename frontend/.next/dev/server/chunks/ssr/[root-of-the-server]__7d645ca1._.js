module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[externals]/react [external] (react, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}),
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
}),
"[project]/components/NetworkStatus.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NetworkStatus
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/contractConfig.js [ssr] (ecmascript)");
;
;
;
function NetworkStatus() {
    const [networkName, setNetworkName] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [isCorrectNetwork, setIsCorrectNetwork] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        checkNetwork();
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        };
    }, []);
    const checkNetwork = async ()=>{
        try {
            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });
            const isCorrect = chainId === __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$contractConfig$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["NETWORK_CONFIG"].chainId;
            setIsCorrectNetwork(isCorrect);
            if (isCorrect) {
                setNetworkName('Sepolia');
            } else {
                // Essayer de récupérer le nom du réseau actuel
                const networkNames = {
                    '0x1': 'Ethereum',
                    '0x5': 'Goerli',
                    '0xaa36a7': 'Sepolia',
                    '0x89': 'Polygon'
                };
                setNetworkName(networkNames[chainId] || `Réseau (${chainId})`);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du réseau:', error);
        } finally{
            setLoading(false);
        }
    };
    if (loading) {
        return null;
    }
    if (!isCorrectNetwork) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '16px 20px',
                maxWidth: '300px',
                zIndex: 999,
                animation: 'slideIn 0.3s ease-out',
                fontSize: '0.9rem',
                color: '#ef4444'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        fontWeight: 600,
                        marginBottom: '8px'
                    },
                    children: "⚠️ Mauvais réseau"
                }, void 0, false, {
                    fileName: "[project]/components/NetworkStatus.js",
                    lineNumber: 68,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px'
                    },
                    children: [
                        "Vous êtes connecté à ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                            children: networkName
                        }, void 0, false, {
                            fileName: "[project]/components/NetworkStatus.js",
                            lineNumber: 72,
                            columnNumber: 32
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/NetworkStatus.js",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                    },
                    children: [
                        "Veuillez changer vers ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                            children: "Sepolia Test Network"
                        }, void 0, false, {
                            fileName: "[project]/components/NetworkStatus.js",
                            lineNumber: 75,
                            columnNumber: 33
                        }, this),
                        " dans Metamask"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/NetworkStatus.js",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/NetworkStatus.js",
            lineNumber: 54,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '12px 16px',
            zIndex: 999,
            animation: 'slideIn 0.3s ease-out',
            fontSize: '0.9rem',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                style: {
                    width: '10px',
                    height: '10px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'pulse 2s ease-in-out infinite'
                }
            }, void 0, false, {
                fileName: "[project]/components/NetworkStatus.js",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            "✓ Sepolia Test Network"
        ]
    }, void 0, true, {
        fileName: "[project]/components/NetworkStatus.js",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
}),
"[project]/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NetworkStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/NetworkStatus.js [ssr] (ecmascript)");
;
;
;
;
;
function MyApp({ Component, pageProps }) {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
    }, []);
    // Empêcher le rendu jusqu'à ce que le client soit montage
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/pages/_app.js",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NetworkStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/_app.js",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
const __TURBOPACK__default__export__ = MyApp;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7d645ca1._.js.map