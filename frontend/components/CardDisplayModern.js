import { getIPFSUrl } from '../utils/ipfsUtils';
import { RARITY } from '../utils/config';

const rarityColors = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b'
};

const rarityEmoji = {
  common: '⚪',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡'
};

export default function CardDisplayModern({ 
  card, 
  onSelect, 
  isSelected = false,
  clickable = true 
}) {
  const handleClick = () => {
    if (clickable && onSelect) {
      onSelect(card);
    }
  };

  const getRarityLabel = (rarity) => {
    return RARITY[rarity] || rarity;
  };

  const isLocked = card.lockUntil && card.lockUntil > Math.floor(Date.now() / 1000);

  return (
    <div
      className={`card-display ${isSelected ? 'selected' : ''} ${clickable ? 'clickable' : ''}`}
      onClick={handleClick}
      style={{
        borderColor: isSelected ? rarityColors[card.rarity] : undefined,
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={getIPFSUrl(card.ipfsHash) || '/placeholder.png'}
          alt={card.name || `${card.race} Card`}
          className="card-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          style={{
            display: 'none',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
          }}
        >
          🎴
        </div>

        {isLocked && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#f59e0b',
              backdropFilter: 'blur(5px)',
              fontWeight: 600,
            }}
          >
            🔒 Verrouillée
          </div>
        )}

        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '1rem',
              color: 'white',
              backdropFilter: 'blur(5px)',
              fontWeight: 600,
            }}
          >
            ✓
          </div>
        )}
      </div>

      <div className="card-info">
        <div className="card-name">{card.name || `${card.race} Card`}</div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {card.race}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span>{rarityEmoji[card.rarity]}</span>
          <span
            style={{
              color: rarityColors[card.rarity],
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            {getRarityLabel(card.rarity)}
          </span>
        </div>

        <div className="card-stats">
          <div className="stat">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {card.tokenId ? card.tokenId.substring(0, 6) : '-'}
            </div>
          </div>
          <div className="stat">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valeur</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {card.value || '-'}
            </div>
          </div>
        </div>

        {clickable && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {isSelected ? 'Sélectionnée ✓' : 'Cliquez pour sélectionner'}
          </div>
        )}
      </div>
    </div>
  );
}
