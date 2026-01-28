# 📚 GUIDE COMPLET - Frontend Andromeda Protocol

**Étudiant:** Arsel DIFFO  
**Rôle:** Frontend / DApp & Documentation  
**Date:** Janvier 2026

---

## 🎯 RÉSUMÉ DE VOTRE TRAVAIL

Vous avez créé le frontend complet pour l'Andromeda Protocol, permettant aux utilisateurs d'interagir avec les smart contracts via une interface web intuitive.

### ✅ Ce qui a été implémenté

1. **Connexion Wallet** - Les utilisateurs peuvent connecter Metamask
2. **Affichage des Cartes** - Visualisation de toutes les cartes NFT possédées
3. **Minting** - Création de nouvelles cartes avec Chainlink VRF
4. **Gestion IPFS** - Récupération des images et métadonnées
5. **Gestion des Erreurs** - Messages clairs pour toutes les erreurs
6. **Design Moderne** - Interface spatiale avec animations

---

## 📂 FICHIERS CRÉÉS

### 1. Configuration (`utils/`)

**config.js** - Configuration du contrat et constantes
- Adresse du contrat : 0x317Fbed8fD8491B080f98A8e3540A6cb190908d7
- Configuration réseau Sepolia
- Énumérations (Rareté, Races)
- Constantes du jeu (cooldown, limites)

**web3Utils.js** - Fonctions Web3
- Connexion wallet
- Récupération du contrat
- Gestion des erreurs
- Formatage des données

**ipfsUtils.js** - Gestion IPFS
- Récupération des images
- Récupération des métadonnées
- URLs IPFS

### 2. Composants (`components/`)

**WalletConnect.js** - Connexion Metamask
- Détection de Metamask
- Connexion/Déconnexion
- Changement de réseau automatique
- Affichage de l'adresse

**CardDisplay.js** - Affichage d'une carte
- Image IPFS
- Informations de la carte
- Statut de verrouillage
- Couleurs selon la rareté

**MintCard.js** - Interface de minting
- Bouton de création
- Feedback en temps réel
- Gestion des transactions
- Messages d'erreur/succès

### 3. Pages (`pages/`)

**index.js** - Page principale
- Navigation par onglets
- Affichage de la collection
- Interface de minting
- Gestion de l'état global

---

## 🚀 COMMENT TESTER VOTRE FRONTEND

### Étape 1 : Installation

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

### Étape 2 : Lancement

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrez votre navigateur sur http://localhost:3000

### Étape 3 : Configuration Metamask

1. Installez Metamask (metamask.io)
2. Créez ou importez un wallet
3. Ajoutez le réseau Sepolia
4. Obtenez des ETH de test sur https://sepoliafaucet.com/

### Étape 4 : Tester les fonctionnalités

1. **Connexion** - Cliquez sur "Connecter Metamask"
2. **Minting** - Allez sur "Créer une Carte" et créez une carte
3. **Collection** - Attendez 15 secondes et actualisez pour voir votre carte
4. **Détails** - Cliquez sur une carte pour voir les détails

---

## 📖 EXPLICATION TECHNIQUE

### Comment fonctionne la connexion Wallet ?

1. Le composant `WalletConnect` vérifie si Metamask est installé
2. Il demande l'autorisation de se connecter
3. Il vérifie qu'on est sur Sepolia (sinon, il change de réseau)
4. Il stocke l'adresse dans l'état et appelle le callback

```javascript
const account = await connectWallet();
setAccount(account);
```

### Comment fonctionne le Minting ?

1. L'utilisateur clique sur "Créer une Carte"
2. Le frontend récupère un hash IPFS aléatoire
3. Il appelle la fonction `mint(ipfsHash)` du contrat
4. La transaction est envoyée à Metamask
5. L'utilisateur confirme dans Metamask
6. On attend la confirmation blockchain
7. Chainlink VRF génère les attributs aléatoires (10-30 secondes)
8. La carte est ajoutée à la collection

```javascript
const contract = getContract(true);
const tx = await contract.mint(ipfsHash);
await tx.wait();
```

### Comment afficher les cartes ?

1. On appelle `balanceOf(address)` pour savoir combien de cartes
2. Pour chaque carte, on appelle `tokenOfOwnerByIndex(address, index)`
3. On récupère les données avec `cards(tokenId)`
4. On affiche chaque carte avec le composant `CardDisplay`

```javascript
const balance = await contract.balanceOf(account);
for (let i = 0; i < balance; i++) {
  const tokenId = await contract.tokenOfOwnerByIndex(account, i);
  const cardData = await contract.cards(tokenId);
  // Afficher la carte
}
```

### Comment récupérer les images IPFS ?

1. Chaque carte a un hash IPFS stocké dans le contrat
2. On utilise ce hash pour construire l'URL : `https://gateway.pinata.cloud/ipfs/{hash}`
3. L'image est chargée depuis IPFS
4. Si l'image ne charge pas, on affiche un placeholder

```javascript
const imageUrl = getIPFSUrl(card.ipfsHash);
<img src={imageUrl} alt={card.name} />
```

---

## 🎨 DESIGN ET UX

### Palette de Couleurs

- **Background:** Gradient bleu foncé (#0f172a → #1e293b)
- **Primary:** Violet (#667eea → #764ba2)
- **Rareté Common:** Gris (#9ca3af)
- **Rareté Rare:** Bleu (#3b82f6)
- **Rareté Epic:** Violet (#a855f7)
- **Rareté Legendary:** Or (#eab308)

### Animations

- Hover sur les cartes : translateY(-8px)
- Spinner de chargement : rotation 360°
- Transitions : 0.3s ease

### Responsive

- Grid auto-fit pour les cartes
- Flexbox pour les headers
- Breakpoints pour mobile

---

## 📊 CONTRAINTES RESPECTÉES

### ✅ Tokenisation
- Les cartes sont des NFTs ERC-721
- 4 niveaux de rareté
- 7 races aliens

### ✅ Limites de Possession
- Maximum 10 cartes par utilisateur
- Compteur affiché (X/10)
- Erreur si limite atteinte

### ✅ Contraintes Temporelles
- Cooldown de 5 minutes détecté
- Lock de 10 minutes affiché
- Timestamps formatés

### ✅ IPFS
- Métadonnées sur IPFS
- Images sur IPFS
- Gateway Pinata

### ✅ Gestion des Erreurs
- Messages personnalisés
- Feedback clair
- Validation côté frontend

---

## 📝 DOCUMENTATION À RÉDIGER

Pour votre rapport final, vous devez documenter :

### 1. Présentation du Cas d'Usage

**Titre:** Jeu de Cartes à Collectionner Décentralisé - Andromeda Protocol

**Contexte:**
- Problématique : Centralisation des jeux de cartes traditionnels
- Solution : NFTs avec propriété réelle et échanges décentralisés
- Avantage blockchain : Vérifiable, transparent, possédé par les joueurs

**Cas d'usage:**
- Créer des cartes spatiales avec rareté vérifiable
- Collectionner jusqu'à 10 cartes par joueur
- Échanger des cartes de même rareté
- Fusionner 3 cartes pour obtenir une rareté supérieure

### 2. Rapport Technique Frontend

**Technologies utilisées:**
- Next.js 14 pour le framework
- Ethers.js v5 pour Web3
- Metamask pour le wallet
- IPFS pour le stockage
- CSS-in-JS pour le styling

**Architecture:**
```
Frontend
├── Composants React modulaires
├── Gestion d'état local (useState)
├── Appels smart contracts (ethers.js)
├── Récupération IPFS (fetch)
└── Design responsive
```

**Fonctionnalités implémentées:**
1. Connexion wallet avec détection automatique du réseau
2. Affichage des cartes avec images IPFS
3. Minting avec Chainlink VRF
4. Gestion complète des erreurs
5. Interface utilisateur intuitive

**Choix techniques:**
- Next.js pour le SSR et les performances
- Ethers.js pour la simplicité et la stabilité
- CSS-in-JS pour le scoping des styles
- Pas de bibliothèque UI pour l'originalité

### 3. Guide Utilisateur

**Installation:**
1. Installer Metamask
2. Se connecter au réseau Sepolia
3. Obtenir des ETH de test
4. Visiter l'application

**Utilisation:**
1. Connecter son wallet
2. Créer des cartes
3. Voir sa collection
4. (À venir) Échanger et fusionner

**Dépannage:**
- Problèmes de connexion → Vérifier Metamask
- Transactions échouées → Vérifier le cooldown
- Images manquantes → Attendre le chargement IPFS

---

## 🔍 POINTS D'ATTENTION POUR LA DÉMO

### Ce qui fonctionne bien
✅ Connexion Metamask
✅ Affichage des cartes
✅ Minting (si le contrat a du LINK)
✅ Design et animations
✅ Gestion des erreurs

### Limitations actuelles
⚠️ Échange de cartes non implémenté (à faire)
⚠️ Fusion de cartes non implémentée (à faire)
⚠️ Chainlink VRF nécessite du LINK dans le contrat
⚠️ IPFS peut être lent selon la connexion

### Améliorations possibles
💡 Ajouter l'échange P2P
💡 Ajouter la fusion de cartes
💡 Améliorer le responsive mobile
💡 Ajouter des notifications toast
💡 Ajouter des filtres de tri

---

## 🎓 CONSEILS POUR LA PRÉSENTATION

### Structure de la présentation

1. **Introduction (1 min)**
   - Présenter le projet Andromeda Protocol
   - Expliquer votre rôle dans l'équipe

2. **Démonstration (3-4 min)**
   - Montrer la connexion wallet
   - Créer une carte en direct
   - Montrer la collection
   - Expliquer les fonctionnalités

3. **Aspects techniques (2-3 min)**
   - Architecture du frontend
   - Intégration Web3
   - Gestion IPFS
   - Respect des contraintes

4. **Difficultés et solutions (1-2 min)**
   - Chainlink VRF asynchrone → Feedback utilisateur
   - IPFS lent → Gateway optimisé
   - Gestion d'état → React hooks

5. **Conclusion (1 min)**
   - Récapitulatif
   - Améliorations futures
   - Questions

### Points à mettre en avant

✨ **Interface intuitive et moderne**
✨ **Respect de toutes les contraintes techniques**
✨ **Gestion complète des erreurs**
✨ **Code propre et bien structuré**
✨ **Documentation complète**

---

## 📞 SUPPORT

Si vous avez des questions ou des problèmes :

1. Vérifiez le README.md du frontend
2. Consultez ce guide complet
3. Regardez les commentaires dans le code
4. Testez étape par étape

---

## 🎉 FÉLICITATIONS !

Vous avez créé un frontend complet et fonctionnel pour l'Andromeda Protocol !

Votre travail démontre :
- ✅ Maîtrise de Next.js et React
- ✅ Compréhension de Web3 et Ethereum
- ✅ Intégration de smart contracts
- ✅ Gestion d'IPFS
- ✅ Design et UX

**Bon courage pour la présentation ! 🚀🌌**
