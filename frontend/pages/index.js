import { useEffect, useState } from 'react';
import Head from 'next/head';
import WalletConnect from '../components/WalletConnect';
import MintCard from '../components/MintCard';
import MyCards from '../components/MyCards';
import ExchangeCards from '../components/ExchangeCards';
import FuseCards from '../components/FuseCards';
import { getUserCardsDetailed } from '../utils/web3Utils';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('mint');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // stocker les cartes du wallet connecté
  const [userCards, setUserCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);

    if (newAccount === null) {
      setActiveTab('mint');
      setRefreshTrigger(0);
      setUserCards([]);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // charger/rafraîchir les cartes à chaque changement de compte ou refreshTrigger
  useEffect(() => {
    const load = async () => {
      if (!account) return;

      setCardsLoading(true);
      try {
        const cards = await getUserCardsDetailed(account);
        setUserCards(cards);
      } catch (e) {
        console.error('Erreur chargement userCards:', e);
        setUserCards([]);
      } finally {
        setCardsLoading(false);
      }
    };

    load();
  }, [account, refreshTrigger]);

  return (
    <div className="container">
      <Head>
        <title>Andromeda Protocol - Space Card Collection Game</title>
        <meta name="description" content="Decentralized space card collecting game on Ethereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <span className="logo">🌌</span>
            Andromeda Protocol
          </h1>
          <p className="subtitle">Decentralized Space Card Collection Game</p>
        </div>
        <div className="header-wallet">
          <WalletConnect onConnect={handleAccountChange} />
        </div>
      </header>

      {/* Navigation */}
      {account && (
        <nav className="navigation">
          <button
            className={`nav-btn ${activeTab === 'mint' ? 'active' : ''}`}
            onClick={() => setActiveTab('mint')}
          >
            🎲 Mint
          </button>

          <button
            className={`nav-btn ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            🎴 Ma Collection
          </button>

          <button
            className={`nav-btn ${activeTab === 'exchange' ? 'active' : ''}`}
            onClick={() => setActiveTab('exchange')}
          >
            🔄 Échanger
          </button>

          <button
            className={`nav-btn ${activeTab === 'fuse' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuse')}
          >
            ⚡ Fusionner
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className="main">
        {!account ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>🚀 Bienvenue dans l'Andromeda Protocol</h2>
              <p>
                Collectionnez, échangez et fusionnez des cartes spatiales représentant
                les vaisseaux de 7 civilisations aliens à travers 4 niveaux de rareté.
              </p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🎲</span>
                  <h3>Mint Aléatoire</h3>
                  <p>Utilisez Chainlink VRF pour un tirage équitable</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔄</span>
                  <h3>Échanges P2P</h3>
                  <p>Tradez directement avec d'autres commandants</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <h3>Fusion de Cartes</h3>
                  <p>Combinez 3 cartes pour une rareté supérieure</p>
                </div>
              </div>
              <p className="cta-text">Connectez votre wallet Metamask pour commencer</p>
            </div>
          </div>
        ) : (
          <div className="content-area">
            {cardsLoading && (
              <div style={{ marginBottom: 12, opacity: 0.85 }}>
                Chargement de vos cartes...
              </div>
            )}

            {activeTab === 'mint' && (
              <MintCard account={account} onMintSuccess={triggerRefresh} />
            )}

            {activeTab === 'collection' && (
              <MyCards account={account} refreshTrigger={refreshTrigger} />
            )}

            {activeTab === 'exchange' && (
              <ExchangeCards
                account={account}
                userCards={userCards}
                onRefreshMyCards={triggerRefresh}
              />
            )}

            {activeTab === 'fuse' && (
              <FuseCards
                account={account}
                refreshTrigger={refreshTrigger}
                onFuseSuccess={triggerRefresh}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            Andromeda Protocol © 2026 |{' '}
            <a
              href="https://sepolia.etherscan.io/address/0x317Fbed8fD8491B080f98A8e3540A6cb190908d7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contrat sur Sepolia
            </a>
          </p>
          <p className="team-info">
            Développé par: Jorelle Alice ETOUNDI (Smart Contracts) | Emmanuel AKA (Backend) | Arsel DIFFO (Frontend)
          </p>
        </div>
      </footer>
    </div>
  );
}
