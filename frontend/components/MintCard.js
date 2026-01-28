import { useState, useEffect } from 'react';
import { getContract } from '../utils/web3Utils';
import ipfsHashes from '../public/ipfs-hashes.json';

// Informations sur les 7 races aliens
const ALIEN_RACES = {
  0: {
    name: 'Humans',
    emoji: '👨‍🚀',
    color: '#6b7280',
    description: 'L\'humanité explorant l\'espace',
    traits: ['Adaptables', 'Intelligents', 'Courageux'],
  },
  1: {
    name: 'Zephyrs',
    emoji: '💨',
    color: '#06b6d4',
    description: 'Créatures éthérées des tempêtes célestes',
    traits: ['Rapides', 'Insaisissables', 'Gracieux'],
  },
  2: {
    name: 'Kraths',
    emoji: '⚔️',
    color: '#dc2626',
    description: 'Guerriers blindés d\'une grande force',
    traits: ['Puissants', 'Résistants', 'Guerriers'],
  },
  3: {
    name: 'Preservers',
    emoji: '🌿',
    color: '#16a34a',
    description: 'Gardiens anciens de la nature cosmique',
    traits: ['Sages', 'Anciens', 'Protecteurs'],
  },
  4: {
    name: 'Synthetics',
    emoji: '🤖',
    color: '#8b5cf6',
    description: 'Entités artificielles ultra-évoluées',
    traits: ['Logiques', 'Précis', 'Innovants'],
  },
  5: {
    name: 'Aquarians',
    emoji: '🌊',
    color: '#0ea5e9',
    description: 'Êtres aquatiques des mondes océans',
    traits: ['Fluides', 'Mystérieux', 'Adaptés'],
  },
  6: {
    name: 'Ancients',
    emoji: '✨',
    color: '#fbbf24',
    description: 'Civilisation ancienne transcendante',
    traits: ['Mystiques', 'Puissants', 'Légendaires'],
  },
};

export default function MintCard({ account, onMintSuccess }) {
  const [loading, setLoading] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [confirmationBlocks, setConfirmationBlocks] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [progressStep, setProgressStep] = useState(''); // "selectionning", "confirming", "waiting", "vrf", "finalizing"
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [cardBalance, setCardBalance] = useState(0);
  const [useTestMint, setUseTestMint] = useState(true); // Mode test par défaut

  useEffect(() => {
    if (account) {
      checkCooldownAndBalance();
    }
  }, [account]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Écouter l'événement CardMinted du contrat
  useEffect(() => {
    if (!account || !txHash) return;

    let isSubscribed = true;
    let unsubscribe = null;

    const listenForCardMinted = async () => {
      try {
        console.log(`👂 Configuration du listener CardMinted...`);
        const contract = await getContract();
        
        // Créer un filter pour l'événement CardMinted
        // Paramètres: (tokenId, owner, race, rarity)
        const filter = contract.filters.CardMinted(null, account);
        
        // Listener pour l'événement CardMinted
        const handleCardMinted = (tokenId, owner, race, rarity, event) => {
          if (!isSubscribed) return;
          
          if (owner.toLowerCase() === account.toLowerCase()) {
            const raceNames = ['Humans', 'Zephyrs', 'Kraths', 'Preservers', 'Synthetics', 'Aquarians', 'Ancients'];
            const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary'];
            
            const raceName = raceNames[race] || `Race ${race}`;
            const rarityName = rarityNames[rarity] || `Rarity ${rarity}`;
            
            console.log(`🎉 ÉVÉNEMENT CardMinted détecté!`);
            console.log(`   TokenID: ${tokenId}`);
            console.log(`   Race: ${raceName}`);
            console.log(`   Rareté: ${rarityName}`);
            console.log(`   Block: ${event.blockNumber}`);
            
            setSuccess(`🎉 Carte créée!\n⭐ ${raceName} - ${rarityName}\n🆔 Token #${tokenId}\n✅ Confirmée!`);
          }
        };

        // Écouter les événements futurs
        contract.on(filter, handleCardMinted);
        console.log(`✅ Listener CardMinted activé pour ${account.substring(0, 10)}...`);
        
        // Nettoyer le listener au unmount
        unsubscribe = () => {
          if (contract) {
            contract.off(filter, handleCardMinted);
            console.log(`👂 Listener CardMinted désactivé`);
          }
        };
      } catch (error) {
        console.error("Erreur lors de la mise en place du listener:", error);
      }
    };

    listenForCardMinted();

    // Cleanup
    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [account, txHash]);

  const checkCooldownAndBalance = async () => {
    try {
      const contract = await getContract();
      
      // Vérifier le cooldown
      const lastTx = await contract.lastTransactionTime(account);
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, 300 - (now - Number(lastTx)));
      setCooldown(remaining);

      // Vérifier le nombre de cartes
      const balance = await contract.balanceOf(account);
      setCardBalance(Number(balance));
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
    }
  };

  const getRandomIPFSHash = () => {
    try {
      // Valider les données IPFS
      if (!ipfsHashes || Object.keys(ipfsHashes).length === 0) {
        throw new Error("Données IPFS non disponibles");
      }

      // Choisir une race aléatoire
      const races = Object.keys(ipfsHashes);
      const randomRace = races[Math.floor(Math.random() * races.length)];
      
      // Choisir une rareté aléatoire (basée sur les probabilités)
      const rand = Math.random() * 100;
      let rarity;
      if (rand < 70) rarity = 'common';
      else if (rand < 90) rarity = 'rare';
      else if (rand < 98) rarity = 'epic';
      else rarity = 'legendary';

      const hash = ipfsHashes[randomRace]?.[rarity]?.metadataHash;
      
      if (!hash) {
        console.warn(`Hash non trouvé pour ${randomRace} - ${rarity}`);
        // Fallback: essayer de récupérer n'importe quel hash disponible
        const firstRace = races[0];
        const firstRarity = Object.keys(ipfsHashes[firstRace])[0];
        return ipfsHashes[firstRace][firstRarity].metadataHash;
      }

      console.log(`📌 Hash IPFS sélectionné - Race: ${randomRace}, Rareté: ${rarity}, Hash: ${hash.substring(0, 10)}...`);
      return hash;
    } catch (error) {
      console.error("Erreur lors de la récupération du hash IPFS:", error);
      throw error;
    }
  };

  const handleMint = async () => {
    if (!account) {
      setError("Veuillez connecter votre wallet");
      return;
    }

    if (cardBalance >= 10) {
      setError("Vous avez atteint la limite de 10 cartes. Fusionnez ou échangez des cartes.");
      return;
    }

    if (cooldown > 0) {
      setError(`Cooldown actif. Attendez ${formatCooldown(cooldown)}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgressStep('selecting');
    setProgressMessage('⏳ Sélection des attributs aléatoires...');

    try {
      const contract = await getContract();
      
      // Étape 1: Sélection des attributs
      setProgressMessage('🎲 Tirage aléatoire de la race et rareté...');
      await new Promise(r => setTimeout(r, 500)); // Simulation d'attente
      
      const ipfsHash = getRandomIPFSHash();

      // S'assurer que le hash est une chaîne valide
      if (!ipfsHash || ipfsHash.trim().length === 0) {
        setError("Erreur: Hash IPFS invalide");
        setLoading(false);
        setProgressStep('');
        return;
      }

      console.log(`🚀 Début du mint - Compte: ${account}, Hash IPFS: ${ipfsHash.substring(0, 20)}...`);

      let tx;
      let isVRFMode = false;
      
      if (useTestMint) {
        // Utiliser testMint pour les tests (ne nécessite pas VRF)
        setProgressStep('confirming');
        setProgressMessage('📤 Transaction en cours...\n🦊 Vérification par Metamask');
        
        const randomness = Math.floor(Math.random() * 1000000);
        console.log(`🧪 Appel testMint - Hash: ${ipfsHash.substring(0, 20)}..., Randomness: ${randomness}`);
        console.log(`📋 Contrat exists: ${!!contract}, testMint exists: ${typeof contract.testMint}`);
        
        try {
          setSuccess("🦊 Vérification par Metamask... Veuillez confirmer la transaction.");
          console.log(`📤 Envoi de testMint...`);
          
          tx = await contract.testMint(ipfsHash, randomness);
          
          console.log(`✅ Transaction envoyée! Hash: ${tx.hash}`);
          setTxHash(tx.hash);
          setProgressMessage(`✅ Transaction envoyée!\n⏳ Blockchain en cours...`);
          setSuccess(`✅ Transaction reçue!\n⏳ En attente de confirmation...\n🔗 ${tx.hash.substring(0, 20)}...`);
          
          // Attendre la confirmation
          const receipt = await tx.wait();
          
          console.log(`✅ Confirmée! Block: ${receipt.blockNumber}`);
          setProgressMessage(`✅ Carte créée!`);
          setSuccess(`✅ Carte créée avec succès!\n📊 Block: ${receipt.blockNumber}`);
          
          // Rafraîchir
          setLoading(false);
          setWaitingForConfirmation(false);
          await checkCooldownAndBalance();
          
          if (onMintSuccess) {
            console.log(`📢 Appel onMintSuccess`);
            onMintSuccess();
            await new Promise(r => setTimeout(r, 1000));
            onMintSuccess();
          }
          
          setTimeout(() => {
            setProgressStep('');
            setProgressMessage('');
            setTxHash('');
          }, 3000);
          
        } catch (error) {
          console.error(`❌ Erreur testMint:`, error);
          setProgressStep('');
          
          if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
            setError("❌ Transaction rejetée par l'utilisateur");
          } else {
            setError(`⚠️ ${error.message || 'Erreur testMint'}`);
          }
        }
      } else {
        // Utiliser mint normal (nécessite VRF Chainlink)
        setProgressStep('confirming');
        setProgressMessage('📤 Transaction en cours...\n🦊 Vérification par Metamask');
        
        console.log(`⚙️ Appel mint - Hash: ${ipfsHash.substring(0, 20)}...`);
        
        try {
          setSuccess("🦊 Vérification par Metamask... Veuillez confirmer la transaction.");
          tx = await contract.mint(ipfsHash);
          
          console.log(`✅ Transaction envoyée! Hash: ${tx.hash}`);
          setTxHash(tx.hash);
          setProgressMessage(`✅ Transaction envoyée!\n⏳ VRF Chainlink...`);
          setSuccess(`✅ Transaction reçue!\n⏳ Attente VRF (10-30s)...`);
          
          // Attendre la confirmation
          const receipt = await tx.wait();
          
          console.log(`✅ Confirmée! Block: ${receipt.blockNumber}`);
          setSuccess(`✅ Carte créée avec succès!\n📊 Block: ${receipt.blockNumber}`);
          
          // Rafraîchir
          setLoading(false);
          setWaitingForConfirmation(false);
          await checkCooldownAndBalance();
          
          if (onMintSuccess) {
            console.log(`📢 Appel onMintSuccess`);
            onMintSuccess();
            await new Promise(r => setTimeout(r, 1000));
            onMintSuccess();
          }
          
          setTimeout(() => {
            setProgressStep('');
            setProgressMessage('');
            setTxHash('');
          }, 3000);
          
        } catch (error) {
          console.error(`❌ Erreur mint:`, error);
          setProgressStep('');
          setLoading(false);
          
          if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
            setError("❌ Transaction rejetée par l'utilisateur");
          } else {
            setError(`⚠️ ${error.message || 'Erreur mint'}`);
          }
        }
      }

    } catch (error) {
      console.error("❌ Erreur générale:", error);
      setProgressStep('error');
      setLoading(false);
      setError(`⚠️ ${error.message || "Erreur lors du mint"}`);
    } finally {
      setLoading(false);
      setWaitingForConfirmation(false);
    }
  };

  const formatCooldown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="mint-card-section">
      <div className="section-header">
        <h2>🚀 Minter une nouvelle carte</h2>
        <p>Créez une carte spatiale aléatoire avec Chainlink VRF</p>
      </div>

      <div className="mint-info">
        <div className="info-item">
          <span className="label">Vos cartes:</span>
          <span className="value">{cardBalance} / 10</span>
        </div>
        <div className="info-item">
          <span className="label">Cooldown:</span>
          <span className="value">
            {cooldown > 0 ? formatCooldown(cooldown) : "✅ Disponible"}
          </span>
        </div>
      </div>

      <button
        onClick={handleMint}
        disabled={loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10 || !account}
        className="btn btn-mint btn-mint-primary"
        style={{
          fontSize: '1.2rem',
          padding: '16px 32px',
          minHeight: '60px',
          fontWeight: 'bold',
          backgroundImage: (loading || waitingForConfirmation) ? 'none' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          boxShadow: (loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10) ? 'none' : '0 0 20px rgba(99, 102, 241, 0.5)',
          transform: (loading || waitingForConfirmation || cooldown > 0 || cardBalance >= 10) ? 'scale(1)' : 'scale(1)',
          transition: 'all 0.3s ease',
          opacity: (loading || waitingForConfirmation) ? 0.7 : 1,
        }}
      >
        {waitingForConfirmation ? (
          <>
            <span style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}>⏳</span>
            Confirmation... ({confirmationBlocks} bloc)
          </>
        ) : loading ? (
          <>
            <span style={{ marginRight: '8px' }}>⏳</span>
            Mint en cours...
          </>
        ) : cooldown > 0 ? (
          <>
            <span style={{ marginRight: '8px' }}>⏱️</span>
            Attendez {formatCooldown(cooldown)}
          </>
        ) : cardBalance >= 10 ? (
          <>
            <span style={{ marginRight: '8px' }}>🚫</span>
            Flotte pleine (10/10)
          </>
        ) : (
          <>
            <span style={{ marginRight: '8px' }}>🎲</span>
            Minter une Carte
          </>
        )}
      </button>

      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={useTestMint}
            onChange={(e) => setUseTestMint(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem' }}>
            {useTestMint ? '🧪 Mode TEST (testMint)' : '⚙️ Mode VRF (mint)'}
          </span>
        </label>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {useTestMint 
            ? 'Utilise testMint - Pas de VRF requis (recommandé pour tester)' 
            : 'Utilise mint avec VRF - Nécessite LINK dans le contrat'}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Section Contraintes et Règles */}
      <div className="mint-details" style={{ marginTop: '20px', marginBottom: '25px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '2px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          ⚙️ Règles et Contraintes
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* Cooldown */}
          <div style={{ padding: '15px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5em' }}>⏱️</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Cooldown</span>
            </div>
            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Attendez <strong style={{ color: '#f97316' }}>5 minutes</strong> entre chaque transaction
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
              État actuel: <strong style={{ color: cooldown > 0 ? '#ef4444' : '#10b981' }}>
                {cooldown > 0 ? `${formatCooldown(cooldown)} restant` : 'Disponible ✓'}
              </strong>
            </div>
          </div>

          {/* Limite de cartes */}
          <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5em' }}>🎴</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Limite Cartes</span>
            </div>
            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Stockage max: <strong style={{ color: '#3b82f6' }}>10 cartes</strong> par wallet
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
              Vous en avez: <strong style={{ color: cardBalance >= 10 ? '#ef4444' : '#10b981' }}>
                {cardBalance}/10
              </strong>
            </div>
          </div>

          {/* Coûts */}
          <div style={{ padding: '15px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5em' }}>💰</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Frais TX</span>
            </div>
            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Gas variable selon réseau Sepolia
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
              💡 Vérifiez votre solde ETH sur Sepolia
            </div>
          </div>

          {/* Mode VRF */}
          <div style={{ padding: '15px', background: useTestMint ? 'rgba(168, 85, 247, 0.1)' : 'rgba(139, 92, 246, 0.1)', border: useTestMint ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5em' }}>{useTestMint ? '🧪' : '🔗'}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Mode Mint</span>
            </div>
            <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {useTestMint ? 'Mode TEST (rapide, sans VRF)' : 'Mode VRF (10-30s, aléatoire certifié)'}
            </div>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
              Changez le mode ci-dessous
            </div>
          </div>
        </div>

        <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.9em' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span>📋</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>À savoir:</strong> Ces contraintes protègent le protocole contre les abus. Vous pouvez échangez ou fusionner vos cartes pour faire de la place. Chaque mint a un coût en gas (frais réseau Sepolia).
            </div>
          </div>
        </div>
      </div>

      {/* Section Races Aliens */}
      <div className="mint-details" style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👽 Les 7 Races de l'Andromeda
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '15px' }}>
          {Object.entries(ALIEN_RACES).map(([raceId, race]) => (
            <div
              key={raceId}
              style={{
                padding: '15px',
                background: `linear-gradient(135deg, ${race.color}15 0%, ${race.color}05 100%)`,
                border: `2px solid ${race.color}40`,
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${race.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5em', marginBottom: '8px' }}>{race.emoji}</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '4px', color: race.color }}>
                {race.name}
              </div>
              <div style={{ fontSize: '0.75em', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                {race.description}
              </div>
              <div style={{ fontSize: '0.7em', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {race.traits.map((trait, idx) => (
                  <span key={idx} style={{ background: `${race.color}30`, padding: '2px 6px', borderRadius: '4px', color: race.color }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span>🎯</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Info:</strong> Chaque race possède des caractéristiques uniques. Le tirage aléatoire vous permettra de collectionner toutes les 7 races dans chaque niveau de rareté!
            </div>
          </div>
        </div>
      </div>

      <div className="mint-details">
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Probabilités de rareté
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Common */}
          <div style={{ padding: '12px', background: 'rgba(107, 114, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(107, 114, 128, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span>⚪</span> Common
              </span>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#6b7280' }}>70%</span>
            </div>
            <div style={{ width: '100%', height: '24px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85em' }}>
                70%
              </div>
            </div>
          </div>

          {/* Rare */}
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span>🔵</span> Rare
              </span>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#3b82f6' }}>20%</span>
            </div>
            <div style={{ width: '100%', height: '24px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.85em' }}>
                20%
              </div>
            </div>
          </div>

          {/* Epic */}
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span>🟣</span> Epic
              </span>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#8b5cf6' }}>8%</span>
            </div>
            <div style={{ width: '100%', height: '24px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '8%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.75em' }}>
              </div>
            </div>
          </div>

          {/* Legendary */}
          <div style={{ padding: '12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', border: '2px solid rgba(251, 191, 36, 0.5)', boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <span>🟡</span> Legendary ⭐
              </span>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#fbbf24' }}>2%</span>
            </div>
            <div style={{ width: '100%', height: '24px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '2%', height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #fcd34d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.75em' }}>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span>💡</span>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Astuce:</strong> Les probabilités sont déterminées aléatoirement. Plus haute la rareté, plus rare la carte!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
