import { useState, useEffect, useRef } from 'react';
import { connectWallet, formatAddress, isMetamaskInstalled, setupNetworkListener } from '../utils/web3Utils';

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isDisconnectingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Vérifier si déjà connecté au chargement
    checkConnection();
    
    // Mettre en place les listeners de réseau et compte
    setupNetworkListener();

    // Écouter les changements de compte
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [mounted]);

  const checkConnection = async () => {
    if (!isMetamaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && !isDisconnectingRef.current) {
        setAccount(accounts[0]);
        if (onConnect) onConnect(accounts[0]);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de connexion:", error);
    }
  };

  const handleAccountsChanged = (accounts) => {
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
      setTimeout(() => {
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

  const handleConnect = async () => {
    if (!isMetamaskInstalled()) {
      setError("Metamask n'est pas installé. Installez-le sur metamask.io");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      if (onConnect) onConnect(connectedAccount);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    isDisconnectingRef.current = true;
    setAccount(null);
    if (onConnect) onConnect(null);
    setShowMenu(false);
    setError('');
  };

  if (!mounted) {
    return (
      <div className="wallet-connect">
        <button className="btn btn-connect" disabled>
          Chargement...
        </button>
      </div>
    );
  }

  if (!isMetamaskInstalled()) {
    return (
      <div className="wallet-connect">
        <div className="alert alert-warning">
          <h3>⚠️ Metamask requis</h3>
          <p>Vous devez installer Metamask pour utiliser cette application.</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Installer Metamask
          </a>
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <div className="wallet-connected">
        <div 
          className="account-info"
          onClick={() => setShowMenu(!showMenu)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <span className="status-indicator connected"></span>
          <span className="account-address">{formatAddress(account)}</span>
          <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>▼</span>
        </div>

        {showMenu && (
          <div className="wallet-menu">
            <div className="wallet-menu-header">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Compte connecté</span>
            </div>
            <div className="wallet-menu-account">
              <span className="status-indicator connected" style={{ marginRight: '8px' }}></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {account}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>
                  ✓ Connecté
                </div>
              </div>
            </div>
            <div className="wallet-menu-divider"></div>
            <a
              href={`https://sepolia.etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-menu-item"
              style={{ textDecoration: 'none', color: 'var(--primary)' }}
            >
              🔗 Voir sur Etherscan
            </a>
            <div className="wallet-menu-divider"></div>
            <button
              onClick={handleDisconnect}
              className="wallet-menu-item"
              style={{ color: 'var(--error)' }}
            >
              🚪 Déconnecter
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button 
        onClick={handleConnect}
        disabled={loading}
        className="btn btn-connect"
      >
        {loading ? 'Connexion...' : '🦊 Connecter Metamask'}
      </button>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
    </div>
  );
}
