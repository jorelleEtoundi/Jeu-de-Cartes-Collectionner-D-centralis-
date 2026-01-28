import { useState } from 'react';
import { getContract, handleTransactionError } from '../utils/web3Utils';
import { RARITY } from '../utils/config';
import { getRandomIPFSHash } from '../utils/ipfsUtils';
import CardDisplay from './CardDisplay';

export default function FuseCards({ userCards, onFuseSuccess }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isFusing, setIsFusing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCardSelect = (card) => {
    if (selectedCards.find(c => c.tokenId === card.tokenId)) {
      setSelectedCards(selectedCards.filter(c => c.tokenId !== card.tokenId));
    } else if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleFuse = async () => {
    if (selectedCards.length !== 3) {
      setError('Sélectionnez exactement 3 cartes');
      return;
    }

    setIsFusing(true);
    setError('');

    try {
      const contract = await getContract();
      const ipfsHash = getRandomIPFSHash();
      
      if (!ipfsHash || ipfsHash.trim().length === 0) {
        setError("Erreur: Hash IPFS invalide");
        setIsFusing(false);
        return;
      }
      
      const tokenIds = selectedCards.map(card => card.tokenId);
      
      const tx = await contract.fuse(tokenIds, ipfsHash);
      setSuccess('⏳ Fusion en cours...');
      await tx.wait();
      setSuccess('✅ Fusion réussie !');
      
      setSelectedCards([]);
      if (onFuseSuccess) setTimeout(() => onFuseSuccess(), 2000);
    } catch (error) {
      setError(handleTransactionError(error));
    } finally {
      setIsFusing(false);
    }
  };

  const fusionableCards = (userCards || []).filter(card => {
    const now = Math.floor(Date.now() / 1000);
    return (!card.isLocked || card.lockUntil <= now) && card.rarity < 3;
  });

  return (
    <div className="fuse-container">
      <h2>⚗️ Fusionner des Cartes</h2>
      <p>Combinez 3 cartes de même rareté pour créer 1 carte supérieure</p>

      <div className="selection-counter">
        Sélectionnées: {selectedCards.length}/3
      </div>

      <div className="cards-grid">
        {fusionableCards.map((card) => (
          <CardDisplay
            key={card.tokenId}
            card={card}
            onSelect={() => handleCardSelect(card)}
            isSelected={selectedCards.find(c => c.tokenId === card.tokenId) !== undefined}
          />
        ))}
      </div>

      {selectedCards.length === 3 && (
        <button onClick={handleFuse} disabled={isFusing} className="btn-fuse">
          {isFusing ? 'Fusion...' : 'Fusionner'}
        </button>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <style jsx>{`
        .fuse-container { max-width: 1200px; margin: 0 auto; }
        .selection-counter { text-align: center; margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .btn-fuse { width: 100%; padding: 1.5rem; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 12px; color: white; font-size: 1.25rem; font-weight: 700; cursor: pointer; }
        .alert { margin-top: 1rem; padding: 1rem; border-radius: 8px; text-align: center; }
        .alert-error { background: rgba(239,68,68,0.1); color: #ef4444; }
        .alert-success { background: rgba(16,185,129,0.1); color: #10b981; }
      `}</style>
    </div>
  );
}
