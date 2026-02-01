import { useState } from 'react';
import { RACE_NAMES, RARITY_NAMES, RARITY_COLORS } from '../utils/contractConfig';
import { formatTimestamp, isCardLocked } from '../utils/web3Utils';

// ✅ Préfixes cohérents avec les rarités (corrige le bug du contrat)
const RARITY_PREFIXES = {
  0: "Scout",
  1: "Elite",
  2: "Epic",
  3: "Legendary"
};

// ✅ Noms des races en minuscule pour correspondre aux dossiers d'images du backend
const RACE_FOLDERS = {
  0: "humans",
  1: "zephyrs",
  2: "kraths",
  3: "preservers",
  4: "synthetics",
  5: "aquarians",
  6: "ancients"
};

// ✅ Noms des rarités en minuscule pour correspondre aux fichiers d'images
const RARITY_FILES = {
  0: "common",
  1: "rare",
  2: "epic",
  3: "legendary"
};

/**
 * ✅ Construit l'URL de l'image via le backend local
 * Format : http://localhost:3001/images/zephyrs/epic.png
 */
const getImageUrl = (raceNumber, rarityNumber) => {
  const race = RACE_FOLDERS[raceNumber];
  const rarity = RARITY_FILES[rarityNumber];
  if (!race || !rarity) return null;
  return `http://localhost:3001/images/${race}/${rarity}.png`;
};

export default function CardDisplay({ card, tokenId, onSelect, selected }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!card) return null;

  const raceNumber = typeof card.race === 'object' ? card.race._hex ? parseInt(card.race._hex, 16) : card.race : card.race;
  const rarityNumber = typeof card.rarity === 'object' ? card.rarity._hex ? parseInt(card.rarity._hex, 16) : card.rarity : card.rarity;

  const raceName = RACE_NAMES[raceNumber] || 'Unknown';
  const rarityName = RARITY_NAMES[rarityNumber] || 'Unknown';
  const rarityColor = RARITY_COLORS[rarityNumber] || '#9CA3AF';

  // Nom reconstruit cohérent avec la rareté
  const displayName = `${RARITY_PREFIXES[rarityNumber] || 'Unknown'} ${raceName} Vessel`;

  const locked = card.isLocked && isCardLocked(card.lockUntil);

  // URL de l'image via le backend (pas IPFS)
  const imageUrl = getImageUrl(raceNumber, rarityNumber);

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
              alt={displayName}
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
        <h3 className="card-name">{displayName}</h3>
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