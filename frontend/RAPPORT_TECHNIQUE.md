# Rapport Technique - Frontend Andromeda Protocol

**Projet** : Andromeda Protocol - DApp de Collection de Cartes Spatiales  
**Étudiant** : Arsel DIFFO  
**Rôle** : Frontend Developer & DApp Integration  
**Date** : Janvier 2026

---

## Table des Matières

1. Introduction
2. Architecture Technique
3. Technologies Utilisées
4. Implémentation des Fonctionnalités
5. Intégration Web3
6. Gestion des Contraintes Métier
7. Interface Utilisateur
8. Tests et Validation
9. Défis et Solutions
10. Améliorations Futures

---

## 1. Introduction

### 1.1 Contexte du Projet

Andromeda Protocol est une application décentralisée (DApp) de jeu de cartes à collectionner basée sur la blockchain Ethereum. Ce rapport documente l'implémentation du frontend et l'intégration Web3 réalisée dans le cadre du projet de groupe.

### 1.2 Objectifs du Frontend

- Créer une interface utilisateur intuitive et responsive
- Intégrer la connexion wallet MetaMask
- Implémenter les interactions avec le smart contract
- Gérer les contraintes métier (cooldowns, locks, limites)
- Afficher les NFTs avec leurs métadonnées IPFS
- Fournir un feedback en temps réel à l'utilisateur

### 1.3 Périmètre de Responsabilité

En tant qu'Étudiant 3, mes responsabilités incluaient :
- Développement de l'interface utilisateur (UI)
- Connexion wallet (MetaMask/Phantom)
- Interaction avec les smart contracts
- Gestion des états et du lifecycle de l'application
- Documentation utilisateur et technique
- Rapport final

---

## 2. Architecture Technique

### 2.1 Architecture Générale

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js/React)        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Components  │  │  Pages (Routes) │ │
│  └──────────────┘  └─────────────────┘ │
│          │                  │           │
│  ┌───────▼──────────────────▼────────┐ │
│  │      Utils (Web3 Helpers)         │ │
│  └───────┬───────────────────────────┘ │
│          │                              │
└──────────┼──────────────────────────────┘
           │
    ┌──────▼──────┐
    │   ethers.js │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────┐
    │  MetaMask (Web3 Provider)   │
    └──────┬──────────────────────┘
           │
    ┌──────▼────────────────────────┐
    │  Ethereum Network (Sepolia)   │
    │                               │
    │  Smart Contract:              │
    │  AndromedaProtocol.sol        │
    │  0x317Fbed8...                │
    └───────────────────────────────┘
```

### 2.2 Structure du Projet

```
frontend/
├── components/              # Composants React réutilisables
│   ├── Header.js           # En-tête avec connexion wallet
│   ├── Card.js             # Affichage d'une carte NFT
│   ├── MintCard.js         # Interface de minting
│   ├── MyCards.js          # Collection de l'utilisateur
│   ├── ExchangeCard.js     # Interface d'échange
│   └── FuseCards.js        # Interface de fusion
│
├── pages/                  # Pages Next.js
│   ├── index.js           # Page principale
│   └── _app.js            # Wrapper de l'application
│
├── utils/                  # Fonctions utilitaires
│   ├── web3.js            # Interactions Web3
│   └── config.js          # Configuration du contrat
│
├── contracts/              # ABI du smart contract
│   └── AndromedaProtocol.json
│
├── styles/                 # Styles CSS
│   └── globals.css        # Styles globaux (Tailwind)
│
├── public/                 # Assets statiques
│
├── package.json            # Dépendances
├── next.config.js          # Configuration Next.js
├── tailwind.config.js      # Configuration Tailwind
└── README.md              # Documentation
```

### 2.3 Flux de Données

1. **Initialisation**
   - L'utilisateur charge l'application
   - Détection de MetaMask
   - Vérification de la connexion existante

2. **Connexion Wallet**
   - L'utilisateur clique sur "Connect Wallet"
   - MetaMask demande l'autorisation
   - Récupération de l'adresse et du signer
   - Vérification/changement de réseau vers Sepolia

3. **Interactions Blockchain**
   - L'utilisateur effectue une action (mint, exchange, fuse)
   - Construction de la transaction via ethers.js
   - Soumission à MetaMask pour signature
   - Attente de confirmation on-chain
   - Mise à jour de l'UI avec le résultat

4. **Affichage des Données**
   - Récupération des NFTs possédés
   - Lecture des métadonnées depuis le contrat
   - Chargement des images depuis IPFS
   - Affichage dans l'interface

---

## 3. Technologies Utilisées

### 3.1 Framework et Librairies

#### Next.js 14
- **Raison du choix** : Framework React moderne avec SSR
- **Avantages** :
  - Routing intégré
  - Optimisation automatique
  - Performance excellente
  - SEO-friendly (si nécessaire)

#### React 18
- **Raison du choix** : Librairie UI de référence
- **Avantages** :
  - Composants réutilisables
  - Hooks pour la gestion d'état
  - Large écosystème
  - Documentation complète

#### Tailwind CSS 3
- **Raison du choix** : Framework CSS utility-first
- **Avantages** :
  - Développement rapide
  - Design cohérent
  - Responsive natif
  - Classes utilitaires prêtes à l'emploi

### 3.2 Web3 et Blockchain

#### ethers.js v5.7.2
- **Raison du choix** : Librairie Web3 moderne et légère
- **Avantages** :
  - API simple et claire
  - TypeScript natif
  - Bien maintenue
  - Documentation excellente
- **Alternative** : web3.js (plus ancien, plus lourd)

#### MetaMask
- **Raison du choix** : Wallet le plus populaire
- **Avantages** :
  - Installation simple
  - Large adoption
  - Support multi-chain
  - API standardisée (EIP-1193)

### 3.3 Stockage Décentralisé

#### IPFS (via Pinata Gateway)
- **Raison du choix** : Stockage décentralisé pour les métadonnées et images
- **Avantages** :
  - Décentralisation complète
  - Pérennité des données
  - Pas de serveur centralisé
  - Standard NFT

### 3.4 Smart Contract Interaction

#### ABI (Application Binary Interface)
- Fichier JSON exporté depuis Hardhat
- Contient toutes les signatures de fonctions
- Permet à ethers.js de communiquer avec le contrat

#### Contract Address
- `0x317Fbed8fD8491B080f98A8e3540A6cb190908d7`
- Déployé sur Sepolia testnet
- Vérifié sur Etherscan

---

## 4. Implémentation des Fonctionnalités

### 4.1 Connexion Wallet

#### Fichier : `components/Header.js`

**Fonctionnalités implémentées** :
- Détection de MetaMask
- Connexion au wallet
- Changement automatique vers Sepolia
- Affichage de l'adresse connectée
- Écoute des changements de compte
- Gestion du réseau

**Code clé** :
```javascript
const handleConnect = async () => {
  const { provider, signer, address } = await connectWallet();
  setProvider(provider);
  setSigner(signer);
  setAccount(address);
};
```

**Gestion des événements** :
- `accountsChanged` : Re-connexion automatique
- `chainChanged` : Rechargement de la page

### 4.2 Minting de Cartes

#### Fichier : `components/MintCard.js`

**Fonctionnalités implémentées** :
- Vérification du cooldown en temps réel
- Input optionnel pour hash IPFS
- Soumission de transaction
- Écoute des événements `CardMinted`
- Affichage des messages de succès/erreur
- Timer de cooldown avec mise à jour chaque seconde

**Processus** :
1. Vérification du cooldown
2. Utilisation du hash IPFS fourni ou par défaut
3. Appel de `contract.mint(ipfsHash)`
4. Attente de la confirmation
5. Extraction du `tokenId` depuis l'événement
6. Notification du parent pour rafraîchir la collection

**Gestion du VRF** :
Le frontend soumet simplement la transaction. Chainlink VRF génère le caractère aléatoire off-chain, ce qui prend 1-2 minutes.

### 4.3 Affichage de la Collection

#### Fichier : `components/MyCards.js`

**Fonctionnalités implémentées** :
- Récupération du balance de l'utilisateur
- Itération sur tous les tokens possédés
- Récupération des détails de chaque carte
- Affichage en grille responsive
- Compteur de cartes (X / 10)
- Avertissement à 10 cartes

**Optimisation** :
- Utilisation de `Promise.all()` pour charger toutes les cartes en parallèle
- Trigger de rafraîchissement après mint/exchange/fuse

**Code clé** :
```javascript
const balance = await contract.balanceOf(account);
for (let i = 0; i < balance; i++) {
  const tokenId = await contract.tokenOfOwnerByIndex(account, i);
  const cardData = await contract.cards(tokenId);
  cards.push({ tokenId, ...cardData });
}
```

### 4.4 Échange de Cartes

#### Fichier : `components/ExchangeCard.js`

**Fonctionnalités implémentées** :
- Sélection d'une carte personnelle
- Input pour l'adresse du partenaire
- Chargement des cartes du partenaire
- Sélection de la carte du partenaire
- Vérification de correspondance des raretés
- Soumission de l'échange
- Filtrage des cartes verrouillées

**Validations** :
- Les deux cartes doivent exister
- Même rareté requise
- Aucune carte verrouillée
- Cooldown respecté

**Processus** :
1. L'utilisateur sélectionne sa carte
2. Entre l'adresse du partenaire
3. Charge les cartes disponibles du partenaire
4. Sélectionne la carte souhaitée
5. Valide les critères (rareté, locks)
6. Soumet la transaction `exchange(myTokenId, otherAddress, otherTokenId)`
7. Les cartes sont échangées atomiquement

### 4.5 Fusion de Cartes

#### Fichier : `components/FuseCards.js`

**Fonctionnalités implémentées** :
- Sélection de 3 cartes
- Vérification de rareté identique
- Affichage de la rareté résultante
- Input optionnel pour hash IPFS
- Soumission de la fusion
- Filtrage des cartes Legendary (non fusionnables)

**Conversions** :
- 3 Common → 1 Rare
- 3 Rare → 1 Epic
- 3 Epic → 1 Legendary

**Logique de sélection** :
```javascript
const handleSelectCard = (card) => {
  if (selectedCards.includes(card)) {
    // Désélectionner
    setSelectedCards(selectedCards.filter(c => c !== card));
  } else if (selectedCards.length < 3) {
    // Sélectionner (max 3)
    setSelectedCards([...selectedCards, card]);
  }
};
```

**Validation** :
```javascript
const canFuse = () => {
  if (selectedCards.length !== 3) return false;
  const firstRarity = selectedCards[0].rarity;
  return selectedCards.every(card => card.rarity === firstRarity);
};
```

### 4.6 Affichage des Cartes (Component)

#### Fichier : `components/Card.js`

**Fonctionnalités implémentées** :
- Affichage responsive de la carte
- Image depuis IPFS
- Badge de rareté avec couleur
- Indicateur de verrouillage
- Numéro de token
- Détails (race, valeur, dates)
- Nombre de propriétaires précédents
- Sélection avec bordure jaune

**Gestion IPFS** :
```javascript
const imageUrl = ipfsToHttp(card.ipfsHash);
// Convertit ipfs://QmXXX en https://gateway.pinata.cloud/ipfs/QmXXX
```

**Couleurs de rareté** :
- Common : Gris (#9CA3AF)
- Rare : Bleu (#3B82F6)
- Epic : Violet (#A855F7)
- Legendary : Or (#F59E0B)

---

## 5. Intégration Web3

### 5.1 Configuration du Contrat

#### Fichier : `utils/config.js`

Contient toutes les constantes :
- Adresse du contrat
- Configuration réseau Sepolia
- Mappings des races et raretés
- Couleurs UI
- Descriptions des races
- Constantes du contrat (limites, cooldowns)

### 5.2 Utilitaires Web3

#### Fichier : `utils/web3.js`

**Fonctions principales** :

1. **connectWallet()**
   - Demande l'accès aux comptes
   - Crée provider et signer
   - Vérifie/change le réseau

2. **switchToSepolia()**
   - Change vers Sepolia si nécessaire
   - Ajoute le réseau si absent

3. **getContract(signer)**
   - Retourne l'instance du contrat avec signer
   - Permet les transactions

4. **getContractReadOnly(provider)**
   - Retourne l'instance du contrat en lecture seule
   - Pas de transactions possibles

5. **Helpers**
   - `formatAddress()` : Raccourcit les adresses (0x1234...5678)
   - `formatTimestamp()` : Convertit timestamp en date lisible
   - `checkCooldown()` : Calcule le temps restant
   - `formatCooldownTime()` : Formate en MM:SS
   - `ipfsToHttp()` : Convertit hash IPFS en URL
   - `handleTransactionError()` : Messages d'erreur user-friendly

### 5.3 Gestion des Transactions

**Flux standard** :
```javascript
try {
  const contract = getContract(signer);
  const tx = await contract.functionName(params);
  
  // Transaction soumise, attente de la confirmation
  setSuccess('Transaction submitted...');
  
  const receipt = await tx.wait();
  
  // Transaction confirmée
  setSuccess('Success!');
  
  // Traiter les événements si nécessaire
  const event = receipt.events?.find(e => e.event === 'EventName');
  
} catch (err) {
  setError(handleTransactionError(err));
}
```

**Gestion des erreurs** :
- Code 4001 : Transaction rejetée par l'utilisateur
- Messages du contrat : Traduits en français
- Erreurs réseau : Message générique

### 5.4 Écoute des Événements

Les événements blockchain sont utilisés pour :
- Obtenir le `tokenId` après mint
- Confirmer les échanges
- Récupérer la nouvelle carte après fusion

**Exemple** :
```javascript
const receipt = await tx.wait();
const event = receipt.events?.find(e => e.event === 'CardMinted');
if (event) {
  const tokenId = event.args.tokenId.toString();
  console.log('New card:', tokenId);
}
```

---

## 6. Gestion des Contraintes Métier

### 6.1 Cooldown (5 minutes)

**Implémentation** :
- Lecture de `lastTransactionTime(address)` depuis le contrat
- Calcul du temps écoulé
- Mise à jour toutes les secondes avec `setInterval`
- Désactivation des boutons pendant le cooldown
- Affichage du timer en format MM:SS

**Code** :
```javascript
useEffect(() => {
  const checkUserCooldown = async () => {
    const lastTxTime = await contract.lastTransactionTime(account);
    const cooldownStatus = checkCooldown(lastTxTime, TRANSACTION_COOLDOWN);
    setCooldown(cooldownStatus);
  };
  
  checkUserCooldown();
  const interval = setInterval(checkUserCooldown, 1000);
  
  return () => clearInterval(interval);
}, [signer, account]);
```

### 6.2 Lock (10 minutes pour Rare+)

**Implémentation** :
- Vérification de `card.isLocked` et `card.lockUntil`
- Comparaison avec le timestamp actuel
- Indicateur visuel 🔒 sur les cartes
- Filtrage dans les interfaces d'échange et fusion
- Opacité réduite sur les cartes verrouillées

**Code** :
```javascript
const isLocked = card.isLocked && Date.now() / 1000 < card.lockUntil;

// Filtrage des cartes déverrouillées
const unlockedCards = cards.filter(card => {
  return !card.isLocked || Date.now() / 1000 >= card.lockUntil;
});
```

### 6.3 Limite de Cartes (10 maximum)

**Implémentation** :
- Compteur visible "X / 10"
- Message d'avertissement à 10 cartes
- Le contrat rejette automatiquement le mint au-delà de 10
- Suggestion de fusionner ou échanger

**UI** :
```javascript
{cards.length === MAX_CARDS_PER_OWNER && (
  <div className="warning">
    ⚠️ Maximum atteint. Fusionnez ou échangez pour libérer de l'espace.
  </div>
)}
```

### 6.4 Contraintes d'Échange

**Vérifications** :
- Même rareté requise (frontend + contrat)
- Cartes déverrouillées (filtrage frontend)
- Cooldown respecté (désactivation UI)
- Propriété des cartes (vérifié par le contrat)

**Message d'erreur** :
```javascript
if (selectedMyCard.rarity !== selectedOtherCard.rarity) {
  setError(`Rareté différente : ${RARITIES[selectedMyCard.rarity]} ≠ ${RARITIES[selectedOtherCard.rarity]}`);
  return;
}
```

### 6.5 Contraintes de Fusion

**Vérifications** :
- Exactement 3 cartes (compteur UI)
- Même rareté pour les 3 (validation frontend)
- Aucune carte Legendary (filtrage frontend)
- Toutes déverrouillées (filtrage frontend)

**Logique** :
```javascript
const canFuse = () => {
  if (selectedCards.length !== 3) return false;
  const firstRarity = selectedCards[0].rarity;
  return selectedCards.every(card => card.rarity === firstRarity);
};
```

---

## 7. Interface Utilisateur

### 7.1 Design System

**Palette de couleurs** :
- Fond : Dégradé gris-violet-gris (#1F2937 → #581C87 → #1F2937)
- Primaire : Violet (#8B5CF6)
- Secondaire : Rose (#EC4899)
- Succès : Vert (#10B981)
- Erreur : Rouge (#EF4444)
- Avertissement : Jaune (#F59E0B)

**Typographie** :
- Police : Système (-apple-system, BlinkMacSystemFont, Segoe UI)
- Titres : Font-bold
- Corps : Font-normal
- Monospace : Pour les adresses

**Composants** :
- Boutons : Dégradés, hover avec scale transform
- Cartes : Ombres, bordures colorées selon rareté
- Inputs : Fond sombre, focus avec ring
- Messages : Bordures colorées, fond semi-transparent

### 7.2 Responsive Design

**Breakpoints Tailwind** :
- Mobile : < 640px (1 colonne)
- Tablet : 640-1024px (2-3 colonnes)
- Desktop : > 1024px (4 colonnes)

**Grilles** :
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

**Navigation** :
- Tabs horizontales sur desktop
- Stack vertical sur mobile
- Touch-friendly sur mobile

### 7.3 Animations

**Effets implémentés** :
- Hover scale sur boutons et cartes
- Pulse sur indicateur de connexion
- Spin sur loaders
- Transitions smooth sur tous les changements d'état

**Exemples** :
```css
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### 7.4 Feedback Utilisateur

**Messages** :
- Succès : Fond vert, bordure verte, texte clair
- Erreur : Fond rouge, bordure rouge, texte clair
- Avertissement : Fond jaune, bordure jaune, texte sombre
- Info : Fond bleu, bordure bleue, texte clair

**États de chargement** :
- Spinner animé pendant les transactions
- Texte "Loading..." ou "Minting..." sur les boutons
- Désactivation des boutons pendant le traitement

**Confirmations** :
- Messages détaillés après chaque action
- Numéro de token affiché après mint
- Redirection automatique vers la collection après succès

---

## 8. Tests et Validation

### 8.1 Tests Manuels Effectués

**Connexion Wallet** :
- ✅ Connexion avec MetaMask
- ✅ Changement automatique vers Sepolia
- ✅ Déconnexion/reconnexion
- ✅ Changement de compte
- ✅ Gestion sans MetaMask

**Minting** :
- ✅ Mint avec hash IPFS personnalisé
- ✅ Mint avec hash par défaut
- ✅ Vérification du cooldown
- ✅ Blocage à 10 cartes
- ✅ Affichage de la nouvelle carte

**Échange** :
- ✅ Échange entre deux comptes
- ✅ Vérification de correspondance de rareté
- ✅ Filtrage des cartes verrouillées
- ✅ Erreur si adresse invalide
- ✅ Échange atomique (tout ou rien)

**Fusion** :
- ✅ Fusion de 3 cartes Common → Rare
- ✅ Fusion de 3 cartes Rare → Epic
- ✅ Fusion de 3 cartes Epic → Legendary
- ✅ Blocage si raretés différentes
- ✅ Filtrage des cartes Legendary

**Affichage** :
- ✅ Collection complète affichée
- ✅ Images IPFS chargées
- ✅ Détails des cartes corrects
- ✅ Indicateurs de lock visibles
- ✅ Responsive sur mobile/tablet/desktop

### 8.2 Scénarios de Test

**Scénario 1 : Premier utilisateur**
1. Connexion wallet → Aucune carte
2. Mint 1ère carte → Succès, carte affichée
3. Tentative mint immédiat → Bloqué par cooldown
4. Attente 5 min → Mint disponible

**Scénario 2 : Utilisateur avec 10 cartes**
1. Collection pleine (10/10)
2. Tentative mint → Message d'erreur
3. Fusion de 3 cartes → Succès (7 cartes restantes)
4. Mint possible à nouveau

**Scénario 3 : Échange entre utilisateurs**
1. User A : 1 Common Humans
2. User B : 1 Common Zephyrs
3. User A lance échange → Succès
4. User A obtient Common Zephyrs
5. User B obtient Common Humans

**Scénario 4 : Fusion progressive**
1. Mint de plusieurs cartes Common
2. Fusion 3 Common → 1 Rare (verrouillée 10 min)
3. Attente déverrouillage
4. Avec d'autres Rare, fusion → 1 Epic
5. Avec d'autres Epic, fusion → 1 Legendary

### 8.3 Bugs Identifiés et Résolus

**Bug 1 : Images IPFS ne chargeaient pas**
- Cause : Mauvaise conversion du hash IPFS
- Solution : Fonction `ipfsToHttp()` avec gateway Pinata

**Bug 2 : Cooldown ne se mettait pas à jour**
- Cause : Pas de `setInterval`
- Solution : Mise à jour toutes les secondes avec cleanup

**Bug 3 : Cartes verrouillées apparaissaient dans les sélections**
- Cause : Pas de filtrage
- Solution : Filtrage dans `useEffect` avant affichage

**Bug 4 : Transaction rejetée sans message clair**
- Cause : Erreur MetaMask non gérée
- Solution : Fonction `handleTransactionError()` avec cas spécifiques

**Bug 5 : Après mint, collection ne se rafraîchissait pas**
- Cause : Pas de trigger de mise à jour
- Solution : Prop `refreshTrigger` incrémentée après chaque action

---

## 9. Défis et Solutions

### 9.1 Défi : Gestion Asynchrone

**Problème** : Multiples appels asynchrones au contrat  
**Solution** : Utilisation de `Promise.all()` pour paralléliser

```javascript
const cardPromises = [];
for (let i = 0; i < balance; i++) {
  cardPromises.push(fetchCardData(i));
}
const cards = await Promise.all(cardPromises);
```

### 9.2 Défi : État Global

**Problème** : Partage de l'état entre composants  
**Solution** : Props drilling depuis index.js

Alternative envisagée : Context API ou Redux  
Choix : Props drilling suffisant pour ce projet

### 9.3 Défi : Cooldown Temps Réel

**Problème** : Afficher le temps restant en direct  
**Solution** : `setInterval` avec cleanup dans `useEffect`

```javascript
useEffect(() => {
  const interval = setInterval(updateCooldown, 1000);
  return () => clearInterval(interval); // Cleanup
}, [dependency]);
```

### 9.4 Défi : Gestion des Erreurs

**Problème** : Messages d'erreur cryptiques du contrat  
**Solution** : Mapping des erreurs vers des messages user-friendly

```javascript
if (error.message.includes("CooldownActive")) {
  return "Veuillez attendre la fin du cooldown";
}
```

### 9.5 Défi : IPFS Latence

**Problème** : Images lentes à charger depuis IPFS  
**Solution** : 
- Gateway Pinata (plus rapide que gateway public)
- Image de placeholder pendant le chargement
- Gestion de l'erreur `onError`

---

## 10. Améliorations Futures

### 10.1 Fonctionnalités

**Marketplace** :
- Acheter/vendre des cartes avec ETH
- Système d'enchères
- Historique des prix

**Statistiques** :
- Dashboard avec graphiques
- Rareté de chaque carte dans l'écosystème
- Leaderboard des collectionneurs

**Social** :
- Profils utilisateurs
- Classement
- Achievements/badges

**Notifications** :
- Notifications push pour les échanges
- Alerte quand cooldown terminé
- Email pour nouvelles cartes rares

### 10.2 Technique

**Optimisations** :
- Cache des données du contrat
- Lazy loading des images
- Service Worker pour offline
- Pagination si beaucoup de cartes

**UX** :
- Animations plus fluides (Framer Motion)
- Mode sombre/clair
- Multi-langue (i18n)
- Tutorial interactif

**Web3** :
- Support d'autres wallets (WalletConnect, Coinbase Wallet)
- Multichain (Polygon, Arbitrum)
- Layer 2 pour réduire les frais

**Testing** :
- Tests unitaires (Jest)
- Tests E2E (Cypress)
- Tests d'intégration avec contrat de test

### 10.3 Sécurité

**Améliorations** :
- Rate limiting côté frontend
- Validation plus stricte des inputs
- Audit de sécurité professionnel
- Bug bounty program

---

## Conclusion

Ce projet m'a permis de :
- Maîtriser le développement Web3 avec ethers.js
- Comprendre les contraintes métier d'une DApp
- Créer une interface utilisateur moderne et responsive
- Intégrer des smart contracts Ethereum
- Gérer des NFTs et IPFS
- Travailler en équipe sur un projet blockchain

Les défis rencontrés ont été enrichissants et m'ont permis d'approfondir mes compétences en développement frontend et blockchain.

Le résultat est une DApp fonctionnelle, intuitive et respectant toutes les contraintes du cahier des charges.

---

**Arsel DIFFO**  
Frontend Developer & DApp Integration  
Janvier 2026
