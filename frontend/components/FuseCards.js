import { useEffect, useMemo, useState } from 'react';
import { getContract, getUserCardsDetailed, handleTransactionError } from '../utils/web3Utils';
import CardDisplay from './CardDisplay';

export default function FuseCards({ account, refreshTrigger, onFuseSuccess }) {
  const [cards, setCards] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // strings
  const [loading, setLoading] = useState(false);
  const [fusing, setFusing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!account) return;
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const list = await getUserCardsDetailed(account);
        setCards(list || []);
      } catch (e) {
        console.error('FuseCards load error:', e);
        setCards([]);
        setError("Impossible de charger vos cartes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [account, refreshTrigger]);

  const now = Math.floor(Date.now() / 1000);

  const fuseableCards = useMemo(() => {
    return (cards || []).map((c) => ({
      ...c,
      tokenId: c?.tokenId?.toString?.() ?? String(c?.tokenId),
      isLocked: Boolean(c?.isLocked),
      lockUntil: Number(c?.lockUntil ?? 0),
      ipfsHash: c?.ipfsHash ?? '',
    }));
  }, [cards]);

  const isSelectable = (card) => !card.isLocked || card.lockUntil <= now;

  const toggleSelect = (tokenId) => {
    const id = String(tokenId);
    setError('');
    setSuccess('');

    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  // ✅ Hash auto (obligatoire côté smart contract)
  const autoIpfsHash = useMemo(() => {
    if (selectedIds.length === 0) return 'ipfs://placeholder';
    const first = fuseableCards.find((c) => String(c.tokenId) === String(selectedIds[0]));
    const h = (first?.ipfsHash || '').trim();
    return h.length > 0 ? h : 'ipfs://placeholder';
  }, [selectedIds, fuseableCards]);

  const canFuse = selectedIds.length === 3 && !fusing;

  const disabledReason = useMemo(() => {
    if (fusing) return "Fusion déjà en cours…";
    if (selectedIds.length < 3) return "Sélectionne 3 cartes pour fusionner";
    if (selectedIds.length > 3) return "Trop de cartes sélectionnées (max 3)";
    return "";
  }, [selectedIds.length, fusing]);

  const handleFuse = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    console.log('[Fuse] click', { selectedIds, canFuse, autoIpfsHash });

    if (!canFuse) {
      setError(disabledReason || "Impossible de lancer la fusion");
      return;
    }

    setFusing(true);
    setError('');
    setSuccess('');

    try {
      const contract = await getContract();

      // IMPORTANT: array EXACTEMENT de 3 items
      const tokenIds3 = [selectedIds[0], selectedIds[1], selectedIds[2]];

      const tx = await contract.fuse(tokenIds3, autoIpfsHash);

      setSuccess('⏳ Fusion en cours...');
      await tx.wait();

      setSuccess('✅ Fusion réussie !');
      setSelectedIds([]);

      if (onFuseSuccess) setTimeout(() => onFuseSuccess(), 1000);
    } catch (err) {
      console.error('[Fuse] error', err);
      setError(handleTransactionError(err));
    } finally {
      setFusing(false);
    }
  };

  return (
    <div className="fuse-container">
      <h2>⚡ Fusionner des Cartes</h2>

      <div className="fuse-section">
        <h3>1. Sélectionnez 3 cartes</h3>

        <div className="picked-info">
          Sélection : <b>{selectedIds.length}/3</b>
          {selectedIds.length > 0 && (
            <span className="picked-ids">
              {selectedIds.map((id) => (
                <span key={id} className="pill">#{id}</span>
              ))}
            </span>
          )}
        </div>

        {loading ? (
          <div className="hint">Chargement de vos cartes…</div>
        ) : fuseableCards.length === 0 ? (
          <div className="hint">Aucune carte trouvée sur ce wallet.</div>
        ) : (
          <div className="cards-grid">
            {fuseableCards.map((card) => {
              const id = String(card.tokenId);
              const selected = selectedIds.includes(id);
              const selectable = isSelectable(card);

              return (
                <div
                  key={id}
                  className={`card-pick ${selected ? 'is-selected' : ''} ${!selectable ? 'is-disabled' : ''}`}
                  onClick={() => selectable && toggleSelect(id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-inner">
                    <CardDisplay card={card} tokenId={id} />
                  </div>
                  {selected && <div className="badge">{selectedIds.indexOf(id) + 1}</div>}
                  {!selectable && <div className="lock-badge">🔒 Verrouillée</div>}
                </div>
              );
            })}
          </div>
        )}

        <div className="hint">
          Hash IPFS utilisé automatiquement : <span className="mono">{autoIpfsHash}</span>
        </div>
      </div>

      {/* ✅ Raison si désactivé */}
      {!canFuse && (
        <div className="alert alert-warning">{disabledReason}</div>
      )}

      {/* ✅ bouton toujours au-dessus */}
      <div className="btn-zone">
        <button
          onClick={handleFuse}
          disabled={!canFuse}
          className="btn-fuse"
          type="button"
        >
          {fusing ? 'Fusion en cours…' : 'Confirmer la fusion'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <style>{`
        .fuse-container { max-width: 1200px; margin: 0 auto; padding: 12px; }
        .fuse-section { margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; position: relative; z-index: 1; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

        /* ✅ évite overlays */
        .card-pick { position: relative; border-radius: 14px; cursor: pointer; overflow: hidden; isolation: isolate; z-index: 1; }
        .card-inner { position: relative; z-index: 1; }
        .card-pick.is-selected { box-shadow: 0 0 0 3px rgba(16,185,129,0.55), 0 10px 24px rgba(0,0,0,0.25); transform: translateY(-2px); }
        .card-pick.is-disabled { opacity: 0.55; cursor: not-allowed; }

        .badge { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 999px;
                 display: grid; place-items: center; font-weight: 900;
                 background: rgba(16,185,129,0.9); color: white; z-index: 5; pointer-events: none; }

        .lock-badge { position: absolute; bottom: 10px; right: 10px; padding: 6px 10px; border-radius: 999px;
                      background: rgba(0,0,0,0.55); color: white; font-weight: 700; z-index: 5; pointer-events: none; }

        .picked-info { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 10px 0 16px; padding: 10px 12px; border-radius: 10px; background: rgba(16,185,129,0.08); }
        .picked-ids { display: flex; gap: 8px; flex-wrap: wrap; }
        .pill { padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.10); }

        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

        .hint { margin-top: 10px; opacity: 0.85; font-size: 0.95rem; }

        /* ✅ Zone bouton au-dessus de tout */
        .btn-zone { position: relative; z-index: 99999; pointer-events: auto; }

        .btn-fuse {
          width: 100%;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.15rem;
          font-weight: 800;
          cursor: pointer;
          pointer-events: auto;
        }
        .btn-fuse:disabled { opacity: 0.6; cursor: not-allowed; }

        .alert { margin-top: 1rem; padding: 1rem; border-radius: 8px; text-align: center; }
        .alert-error { background: rgba(239,68,68,0.1); color: #ef4444; }
        .alert-success { background: rgba(16,185,129,0.1); color: #10b981; }
        .alert-warning { background: rgba(245,158,11,0.12); color: #f59e0b; }
      `}</style>
    </div>
  );
}
