import { useState } from 'react';
import { RACE_NAMES, RARITY_NAMES, RARITY_COLORS } from '../utils/contractConfig';
import { formatTimestamp, isCardLocked, getIPFSUrl } from '../utils/web3Utils';

export default function CardDisplay({ card, tokenId, onSelect, selected }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!card) return null;

  const raceNumber = typeof card.race === 'object' ? card.race._hex ? parseInt(card.race._hex, 16) : card.race : card.race;
  const rarityNumber = typeof card.rarity === 'object' ? card.rarity._hex ? parseInt(card.rarity._hex, 16) : card.rarity : card.rarity;
  
  const raceName = RACE_NAMES[raceNumber] || 'Unknown';
  const rarityName = RARITY_NAMES[rarityNumber] || 'Unknown';
  const rarityColor = RARITY_COLORS[rarityNumber] || '#9CA3AF';
  
  const locked = card.isLocked && isCardLocked(card.lockUntil);
  const imageUrl = getIPFSUrl(card.ipfsHash);

  const handleClick = () => {
    if (onSelect && !locked) {
      onSelect(tokenId);
    }
  };

  return (
    <div 
      className={`card-item ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
      onClick={handleClick}
      style={{ borderColor: rarityColor }}
    >
      {/* Badge de rareté */}
      <div className="rarity-badge" style={{ backgroundColor: rarityColor }}>
        {rarityName}
      </div>

      {/* Image de la carte */}
      <div className="card-image-container">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="image-loading">
                <div className="spinner"></div>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={card.name}
              className={`card-image ${imageLoading ? 'loading' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          <div className="card-placeholder">
            <span className="placeholder-icon">🚀</span>
            <span className="placeholder-race">{raceName}</span>
          </div>
        )}
      </div>

      {/* Informations de la carte */}
      <div className="card-info">
        <h3 className="card-name">{card.name}</h3>
        <p className="card-race">Race: {raceName}</p>
        <p className="card-value">Valeur: {card.value?.toString() || '0'}</p>
        <p className="card-id">Token ID: #{tokenId}</p>
      </div>

      {/* Statut */}
      <div className="card-status">
        {locked && (
          <span className="status-locked">
            🔒 Verrouillée
          </span>
        )}
        {selected && (
          <span className="status-selected">
            ✓ Sélectionnée
          </span>
        )}
      </div>

      {/* Métadonnées */}
      <div className="card-metadata">
        <p className="card-created">
          Créée: {formatTimestamp(card.createdAt)}
        </p>
        {card.lastTransferAt && card.lastTransferAt > 0 && (
          <p className="card-transfer">
            Transférée: {formatTimestamp(card.lastTransferAt)}
          </p>
        )}
      </div>

      {/* Historique des propriétaires */}
      {card.previousOwners && card.previousOwners.length > 0 && (
        <div className="card-history">
          <p className="history-title">Propriétaires précédents:</p>
          <p className="history-count">{card.previousOwners.length} propriétaire(s)</p>
        </div>
      )}
    </div>
  );
}
