import { useState, useEffect } from 'react';
import { getAllTokenIds, getCardDetails } from '../utils/web3Utils';
import CardDisplay from './CardDisplay';

export default function MyCards({ account, refreshTrigger }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      loadCards();
    }
  }, [account, refreshTrigger]);

  const loadCards = async () => {
    if (!account) return;

    setLoading(true);
    setError('');

    try {
      // Petit délai pour s'assurer que la blockchain a finalisé la transaction
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tokenIds = await getAllTokenIds(account);
      console.log(`📌 getAllTokenIds retourné: ${tokenIds.length} cartes`);
      
      if (tokenIds.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }
      
      // Charger les détails de chaque carte via cards(tokenId)
      const cardsData = await Promise.all(
        tokenIds.map((tokenId) => getCardDetails(tokenId))
      );
      
      const validCards = cardsData.filter(Boolean);
      console.log(`🎴 Cartes chargées: ${validCards.length}/${tokenIds.length}`);
      setCards(validCards);
    } catch (error) {
      console.error("Erreur lors du chargement des cartes:", error);
      setError("Impossible de charger vos cartes");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="my-cards-section">
        <div className="alert alert-info">
          Connectez votre wallet pour voir vos cartes
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-cards-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de vos cartes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-cards-section">
        <div className="alert alert-error">
          {error}
        </div>
        <button onClick={loadCards} className="btn btn-secondary">
          Réessayer
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="my-cards-section">
        <div className="empty-state">
          <h2>🚀 Aucune carte pour le moment</h2>
          <p>Mintez votre première carte pour commencer votre collection!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-cards-section">
      <div className="section-header">
        <div>
          <h2>{<span style={{ display:'inline-flex', alignItems:'center', verticalAlign:'middle', width:'1em', height:'1em', marginRight:'8px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:'100%', height:'100%' }}><rect x="2" y="5" width="16" height="13" rx="2" ry="2"/><rect x="6" y="2" width="16" height="13" rx="2" ry="2" fill="rgba(99,102,241,0.15)"/><path d="M14 9l-2 4 3-1-3 4" strokeWidth="1.5"/></svg></span>}Ma Collection</h2>
          <p>{cards.length} carte{cards.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={loadCards} className="btn btn-refresh">
          🔄 Rafraîchir
        </button>
      </div>

      <div className="cards-grid">
        {cards.map((cardData) => (
          <CardDisplay
            key={cardData.tokenId}
            tokenId={cardData.tokenId}
            card={cardData}
          />
        ))}
      </div>
    </div>
  );
}
