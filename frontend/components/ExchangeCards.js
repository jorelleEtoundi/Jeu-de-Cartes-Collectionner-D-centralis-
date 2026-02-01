import { useMemo, useState } from 'react';
import {
  getContract,
  getContractReadOnly,
  getUserCardsDetailed,
  handleTransactionError,
} from '../utils/web3Utils';
import CardDisplay from './CardDisplay';

export default function ExchangeCards({ account, userCards = [], onRefreshMyCards }) {
  const [selectedMyCard, setSelectedMyCard] = useState(null);
  const [otherUserAddress, setOtherUserAddress] = useState('');
  const [otherUserCards, setOtherUserCards] = useState([]);
  const [selectedOtherCard, setSelectedOtherCard] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const now = Math.floor(Date.now() / 1000);

  const myCards = useMemo(() => {
    return (userCards || []).map((c) => ({
      ...c,
      tokenId: c?.tokenId?.toString?.() ?? String(c?.tokenId),
      isLocked: Boolean(c?.isLocked),
      lockUntil: Number(c?.lockUntil ?? 0),
    }));
  }, [userCards]);

  const exchangeableMyCards = useMemo(() => {
    return myCards.filter((c) => !c.isLocked || c.lockUntil <= now);
  }, [myCards, now]);

  const loadOtherUserCards = async () => {
    const addr = otherUserAddress.trim();

    setError('');
    setSuccess('');
    setSelectedOtherCard(null);
    setOtherUserCards([]);

    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setError('Adresse invalide');
      return;
    }
    if (addr.toLowerCase() === account.toLowerCase()) {
      setError('Vous ne pouvez pas échanger avec vous-même');
      return;
    }

    setIsLoading(true);
    try {
      const cards = await getUserCardsDetailed(addr);
      if (!cards || cards.length === 0) {
        setError("Cet utilisateur n'a aucune carte");
        return;
      }
      // normalise tokenId
      setOtherUserCards(
        cards.map((c) => ({
          ...c,
          tokenId: c?.tokenId?.toString?.() ?? String(c?.tokenId),
        }))
      );
    } catch (e) {
      console.error('Erreur chargement cartes other user:', e);
      setError('Impossible de charger les cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const canClickExchange = Boolean(selectedMyCard && selectedOtherCard && !isExchanging);

  const handleExchange = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    // ✅ debug : tu verras dans la console si le clic part
    console.log('[EXCHANGE] click', {
      selectedMyCard,
      selectedOtherCard,
      otherUserAddress: otherUserAddress.trim(),
      canClickExchange,
    });

    setError('');
    setSuccess('');

    if (!selectedMyCard || !selectedOtherCard) {
      setError('Sélectionnez votre carte ET la carte à recevoir.');
      return;
    }

    const addr = otherUserAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setError('Adresse invalide');
      return;
    }

    setIsExchanging(true);

    try {
      const read = getContractReadOnly();

      // ✅ pré-checks utiles : si ça revert, tu auras un message clair AVANT MetaMask
      // 1) vérifier ownership des deux tokens
      const ownerMy = await read.ownerOf(selectedMyCard.tokenId);
      if (ownerMy.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Vous n'êtes plus le propriétaire de votre carte sélectionnée.");
      }

      const ownerOther = await read.ownerOf(selectedOtherCard.tokenId);
      if (ownerOther.toLowerCase() !== addr.toLowerCase()) {
        throw new Error("L'autre utilisateur n'est plus le propriétaire de la carte sélectionnée.");
      }

      // 2) cooldown (si ton contrat bloque les transactions trop fréquentes)
      if (read.canTransact) {
        const canMe = await read.canTransact(account);
        if (!canMe) {
          throw new Error("Cooldown actif : vous ne pouvez pas encore effectuer une transaction.");
        }
        const canOther = await read.canTransact(addr);
        if (!canOther) {
          throw new Error("Cooldown actif : l'autre utilisateur ne peut pas encore effectuer une transaction.");
        }
      }

      // ✅ envoi transaction
      const contract = await getContract();
      const tx = await contract.exchange(
        selectedMyCard.tokenId,
        addr,
        selectedOtherCard.tokenId
      );

      setSuccess('⏳ Transaction en cours...');
      await tx.wait();

      setSuccess('✅ Échange réussi !');

      // reset
      setSelectedMyCard(null);
      setSelectedOtherCard(null);
      setOtherUserAddress('');
      setOtherUserCards([]);

      if (onRefreshMyCards) setTimeout(() => onRefreshMyCards(), 1000);
    } catch (err) {
      console.error('[EXCHANGE] error', err);
      // si c'est un revert/estimateGas, handleTransactionError te renverra quelque chose de lisible
      setError(handleTransactionError(err) || err?.message || "Erreur lors de l'échange");
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <div className="exchange-container">
      <h2>🔄 Échanger des Cartes</h2>

      {/* ✅ messages toujours visibles */}
      {(error || success) && (
        <div className={`toast ${error ? 'toast-error' : 'toast-success'}`}>
          {error || success}
        </div>
      )}

      <div className="exchange-section">
        <h3>1. Votre carte</h3>

        {exchangeableMyCards.length === 0 ? (
          <div className="hint">Aucune carte échangeable (verrouillée ou inexistante).</div>
        ) : (
          <div className="cards-grid">
            {exchangeableMyCards.map((card) => {
              const isSelected = String(selectedMyCard?.tokenId) === String(card.tokenId);
              return (
                <div
                  key={String(card.tokenId)}
                  className={`card-pick ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedMyCard(card);
                    setError('');
                    setSuccess('');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-inner">
                    <CardDisplay card={card} tokenId={card.tokenId} />
                  </div>
                  {isSelected && <div className="badge">✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="exchange-section address-section">
        <h3>2. Adresse de l'autre utilisateur</h3>

        <div className="address-row">
          <input
            type="text"
            placeholder="0x..."
            value={otherUserAddress}
            onChange={(e) => {
              setOtherUserAddress(e.target.value);
              setOtherUserCards([]);
              setSelectedOtherCard(null);
              setError('');
              setSuccess('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && loadOtherUserCards()}
            className="address-input"
            autoComplete="off"
            spellCheck={false}
          />

          <button
            onClick={loadOtherUserCards}
            disabled={isLoading || !/^0x[a-fA-F0-9]{40}$/.test(otherUserAddress.trim())}
            className="btn-load"
            type="button"
          >
            {isLoading ? 'Chargement...' : 'Charger'}
          </button>
        </div>

        <div className="hint">Entrée = Charger</div>
      </div>

      {otherUserCards.length > 0 && (
        <div className="exchange-section">
          <h3>3. Carte à recevoir</h3>

          <div className="cards-grid">
            {otherUserCards.map((card) => {
              const isSelected = String(selectedOtherCard?.tokenId) === String(card.tokenId);
              return (
                <div
                  key={String(card.tokenId)}
                  className={`card-pick ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedOtherCard(card);
                    setError('');
                    setSuccess('');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-inner">
                    <CardDisplay card={card} tokenId={card.tokenId} />
                  </div>
                  {isSelected && <div className="badge">✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ bouton en zone haute priorité (anti overlay) */}
      <div className="btn-zone">
        <button
          onClick={handleExchange}
          disabled={!canClickExchange}
          className="btn-exchange"
          type="button"
        >
          {isExchanging ? 'Échange en cours…' : "Confirmer l'échange"}
        </button>
      </div>

      {!canClickExchange && (
        <div className="hint">
          Il faut sélectionner votre carte + la carte à recevoir, et saisir l’adresse de l’autre utilisateur.
        </div>
      )}

      <style>{`
        .exchange-container { max-width: 1200px; margin: 0 auto; padding: 12px; }

        /* ✅ toast sticky pour voir les erreurs même si on scroll */
        .toast {
          position: sticky;
          top: 10px;
          z-index: 999999;
          margin: 10px 0 18px;
          padding: 12px 14px;
          border-radius: 10px;
          text-align: center;
          font-weight: 700;
          backdrop-filter: blur(6px);
        }
        .toast-error { background: rgba(239,68,68,0.18); color: #ffb4b4; border: 1px solid rgba(239,68,68,0.35); }
        .toast-success { background: rgba(16,185,129,0.18); color: #b8ffe1; border: 1px solid rgba(16,185,129,0.35); }

        .exchange-section { margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; position: relative; z-index: 1; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

        /* ✅ anti overlays */
        .card-pick { position: relative; border-radius: 14px; cursor: pointer; overflow: hidden; isolation: isolate; }
        .card-inner { position: relative; z-index: 1; }
        .card-pick.is-selected { box-shadow: 0 0 0 3px rgba(16,185,129,0.55), 0 10px 24px rgba(0,0,0,0.25); transform: translateY(-2px); }

        .badge { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 999px;
                 display: grid; place-items: center; font-weight: 900;
                 background: rgba(16,185,129,0.9); color: white; z-index: 5; pointer-events: none; }

        /* ✅ input au-dessus */
        .address-section { z-index: 9999; }
        .address-row { display: flex; gap: 12px; align-items: center; position: relative; z-index: 10000; }
        .address-input {
          flex: 1; padding: 1rem; background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; color: white;
          position: relative; z-index: 10001; pointer-events: auto;
        }
        .btn-load { padding: 1rem 1.2rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 800; z-index: 10001; }

        /* ✅ bouton au-dessus de tout */
        .btn-zone { position: relative; z-index: 999999; pointer-events: auto; }
        .btn-exchange {
          width: 100%;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.25rem;
          font-weight: 900;
          cursor: pointer;
          pointer-events: auto;
        }
        .btn-exchange:disabled { opacity: 0.6; cursor: not-allowed; }

        .hint { margin-top: 10px; opacity: 0.85; font-size: 0.95rem; }
      `}</style>
    </div>
  );
}
