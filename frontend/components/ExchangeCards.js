import { useState } from 'react';
import { getContract, getContractReadOnly, handleTransactionError, getAllTokenIds, getCardDetails } from '../utils/web3Utils';
import CardDisplay from './CardDisplay';

export default function ExchangeCards({ account, userCards, onExchangeSuccess }) {
  const [selectedMyCard, setSelectedMyCard] = useState(null);
  const [otherUserAddress, setOtherUserAddress] = useState('');
  const [otherUserCards, setOtherUserCards] = useState([]);
  const [selectedOtherCard, setSelectedOtherCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOtherUserCards = async () => {
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
      // ✅ Utilise getAllTokenIds + getCardDetails (lecture via Alchemy, pas MetaMask)
      const tokenIds = await getAllTokenIds(otherUserAddress);

      if (tokenIds.length === 0) {
        setError('Cet utilisateur n\'a aucune carte');
        setOtherUserCards([]);
        setIsLoading(false);
        return;
      }

      const cards = await Promise.all(
        tokenIds.map((tokenId) => getCardDetails(tokenId))
      );

      const validCards = cards.filter(Boolean);
      setOtherUserCards(validCards);
    } catch (error) {
      console.error('Erreur chargement cartes:', error);
      setError('Impossible de charger les cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExchange = async () => {
    if (!selectedMyCard || !selectedOtherCard) return;

    setIsExchanging(true);
    setError('');

    try {
      // ✅ getContract() avec await — utilisé SEULEMENT pour écrire (MetaMask signe)
      const contract = await getContract();
      const tx = await contract.exchange(
        selectedMyCard.tokenId,
        otherUserAddress,
        selectedOtherCard.tokenId
      );

      setSuccess('⏳ Transaction en cours...');
      await tx.wait();
      setSuccess('✅ Échange réussi !');
      
      if (onExchangeSuccess) setTimeout(() => onExchangeSuccess(), 2000);
    } catch (error) {
      setError(handleTransactionError(error));
    } finally {
      setIsExchanging(false);
    }
  };

  const exchangeableCards = (userCards || []).filter(card => {
    const now = Math.floor(Date.now() / 1000);
    return !card.isLocked || card.lockUntil <= now;
  });

  return (
    <div className="exchange-container">
      <h2>🔄 Échanger des Cartes</h2>
      
      <div className="exchange-section">
        <h3>1. Votre carte</h3>
        <div className="cards-grid">
          {exchangeableCards.map((card) => (
            <CardDisplay
              key={card.tokenId}
              card={card}
              tokenId={card.tokenId}
              onSelect={() => setSelectedMyCard(card)}
              selected={selectedMyCard?.tokenId === card.tokenId}
            />
          ))}
        </div>
      </div>

      <div className="exchange-section">
        <h3>2. Adresse de l'autre utilisateur</h3>
        <input
          type="text"
          placeholder="0x..."
          value={otherUserAddress}
          onChange={(e) => setOtherUserAddress(e.target.value)}
          className="address-input"
        />
        <button onClick={loadOtherUserCards} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Charger'}
        </button>
      </div>

      {otherUserCards.length > 0 && (
        <div className="exchange-section">
          <h3>3. Carte à recevoir</h3>
          <div className="cards-grid">
            {otherUserCards.map((card) => (
              <CardDisplay
                key={card.tokenId}
                card={card}
                tokenId={card.tokenId}
                onSelect={() => setSelectedOtherCard(card)}
                selected={selectedOtherCard?.tokenId === card.tokenId}
              />
            ))}
          </div>
        </div>
      )}

      {selectedMyCard && selectedOtherCard && (
        <button onClick={handleExchange} disabled={isExchanging} className="btn-exchange">
          {isExchanging ? 'Échange en cours...' : 'Confirmer l\'échange'}
        </button>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <style jsx>{`
        .exchange-container { max-width: 1200px; margin: 0 auto; }
        .exchange-section { margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .address-input { width: 100%; padding: 1rem; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; }
        .btn-exchange { width: 100%; padding: 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 12px; color: white; font-size: 1.25rem; font-weight: 700; cursor: pointer; }
        .alert { margin-top: 1rem; padding: 1rem; border-radius: 8px; text-align: center; }
        .alert-error { background: rgba(239,68,68,0.1); color: #ef4444; }
        .alert-success { background: rgba(16,185,129,0.1); color: #10b981; }
      `}</style>
    </div>
  );
}