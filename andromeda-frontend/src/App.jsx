import { useState } from "react";
import { ethers } from "ethers";
import ABI from "./abi/AndromedaProtocol.json";
import { CONTRACT_ADDRESS, CHAIN_ID_HEX } from "./config";

export default function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (!window.ethereum) return setStatus("❌ Installe MetaMask");
    const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(addr);
    setStatus("");
  }

  async function ensureSepolia() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== CHAIN_ID_HEX) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    }
  }

  async function mintRandom() {
    try {
      if (!window.ethereum) return setStatus("❌ Installe MetaMask");
      if (!account) return setStatus("❌ Connecte ton wallet d'abord");

      await ensureSepolia();

      // 1) Récupérer un metadataHash depuis TON backend
      setStatus("🎲 Récupération d'une carte (backend)...");
      const res = await fetch("/api/random-metadata");
      const { metadataHash, race, rarity } = await res.json();

      if (!metadataHash) return setStatus("❌ Backend: metadataHash manquant");

      // 2) Appeler le smart contract : mint(metadataHash)
      setStatus(`📝 Mint ${race}/${rarity}...`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.mint(metadataHash); // <- conforme guide
      setStatus("⛓️ Transaction envoyée, attente confirmation...");
      await tx.wait();

      setStatus("✅ Mint confirmé !");
    } catch (e) {
      console.error(e);
      setStatus(`❌ ${e?.shortMessage || e?.message || "Erreur mint"}`);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Andromeda Protocol</h1>

      <button onClick={connectWallet}>
        {account ? `Wallet: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect MetaMask"}
      </button>

      <button onClick={mintRandom} style={{ marginLeft: 10 }}>
        Mint random
      </button>

      <div style={{ marginTop: 12 }}>{status}</div>
    </div>
  );
}
