import { useState, useEffect } from 'react';
import { NETWORK_CONFIG } from '../utils/contractConfig';

export default function NetworkStatus() {
  const [networkName, setNetworkName] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkNetwork();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, []);

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrect = chainId === NETWORK_CONFIG.chainId;
      setIsCorrectNetwork(isCorrect);

      if (isCorrect) {
        setNetworkName('Sepolia');
      } else {
        // Essayer de récupérer le nom du réseau actuel
        const networkNames = {
          '0x1': 'Ethereum',
          '0x5': 'Goerli',
          '0xaa36a7': 'Sepolia',
          '0x89': 'Polygon',
        };
        setNetworkName(networkNames[chainId] || `Réseau (${chainId})`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{
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
        color: '#ef4444',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
          ⚠️ Mauvais réseau
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Vous êtes connecté à <strong>{networkName}</strong>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Veuillez changer vers <strong>Sepolia Test Network</strong> dans Metamask
        </div>
      </div>
    );
  }

  return (
    <div style={{
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
      gap: '8px',
    }}>
      <span style={{
        width: '10px',
        height: '10px',
        background: '#10b981',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'pulse 2s ease-in-out infinite',
      }}></span>
      ✓ Sepolia Test Network
    </div>
  );
}
