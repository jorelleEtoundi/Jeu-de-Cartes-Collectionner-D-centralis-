# Guide Utilisateur - Andromeda Protocol

**Version:** 1.0  
**Date:** Janvier 2026  
**Auteur:** Arsel DIFFO

---

## Table des Matières

1. Introduction
2. Prérequis
3. Installation et Configuration
4. Utilisation de l'Application
5. Fonctionnalités Principales
6. Contraintes et Règles du Jeu
7. Résolution des Problèmes
8. FAQ

---

## 1. Introduction

### Qu'est-ce qu'Andromeda Protocol ?

Andromeda Protocol est un jeu de cartes à collectionner décentralisé basé sur la blockchain Ethereum. Dans l'année 2500, sept civilisations aliens ont formé le Conseil Galactique et établi le Protocole Andromède - un système décentralisé pour échanger des vaisseaux spatiaux sous forme de NFTs.

### Concept du Jeu

Les joueurs deviennent des commandants qui peuvent :
- Créer (mint) de nouvelles cartes représentant des vaisseaux spatiaux
- Collectionner des cartes de 7 races aliens différentes
- Échanger des cartes avec d'autres joueurs
- Fusionner 3 cartes pour créer une carte de rareté supérieure

### Les Sept Races Aliens

1. **Humans** - Explorateurs innovants de la Terre
2. **Zephyrs** - Êtres d'énergie avec téléportation
3. **Kraths** - Guerriers blindés
4. **Preservers** - Gardiens sages ancestraux
5. **Synthetics** - Conscience IA évoluée
6. **Aquarians** - Habitants aquatiques de l'espace
7. **Ancients** - Civilisation éteinte mystérieuse

### Niveaux de Rareté

- **Common** (Commun) : 70% de probabilité - Valeur: 100
- **Rare** : 20% de probabilité - Valeur: 300
- **Epic** (Épique) : 8% de probabilité - Valeur: 700
- **Legendary** (Légendaire) : 2% de probabilité - Valeur: 1000

---

## 2. Prérequis

### Matériel et Logiciels Nécessaires

- **Navigateur web** : Chrome, Firefox, Brave ou Edge (version récente)
- **MetaMask** : Extension de wallet Web3
- **Connexion Internet** : Stable et sécurisée
- **ETH Sepolia** : Pour payer les frais de transaction (gas)

### Installation de MetaMask

1. Visitez [metamask.io](https://metamask.io)
2. Téléchargez et installez l'extension pour votre navigateur
3. Créez un nouveau wallet ou importez un wallet existant
4. Sauvegardez votre phrase de récupération en lieu sûr
5. Ajoutez le réseau Sepolia Testnet

### Obtenir des ETH Sepolia (Testnet)

1. Visitez un faucet Sepolia : [sepoliafaucet.com](https://sepoliafaucet.com)
2. Entrez votre adresse wallet
3. Demandez des ETH de test (gratuit)
4. Attendez quelques minutes pour recevoir les fonds

---

## 3. Installation et Configuration

### Accéder à l'Application

1. Ouvrez votre navigateur
2. Visitez l'URL de l'application (fournie par votre administrateur)
3. Assurez-vous que MetaMask est installé et déverrouillé

### Configuration du Réseau

L'application se connecte automatiquement au réseau Sepolia. Si vous devez le configurer manuellement :

- **Nom du réseau** : Sepolia Test Network
- **RPC URL** : https://rpc.sepolia.org
- **Chain ID** : 11155111
- **Symbole** : ETH
- **Block Explorer** : https://sepolia.etherscan.io

### Connexion du Wallet

1. Sur la page d'accueil, cliquez sur "Connect Wallet"
2. MetaMask s'ouvrira et demandera votre autorisation
3. Sélectionnez le compte que vous souhaitez connecter
4. Cliquez sur "Suivant" puis "Connecter"
5. Votre adresse apparaîtra dans l'en-tête de l'application

---

## 4. Utilisation de l'Application

### Navigation de l'Interface

L'interface est organisée en 4 onglets principaux :

#### 1. My Collection (Ma Collection)

Affiche toutes vos cartes avec :
- Image de la carte
- Nom et numéro de la carte
- Race alien
- Niveau de rareté (avec couleur)
- Valeur de la carte
- Date de création
- Statut de verrouillage
- Historique des propriétaires précédents

#### 2. Mint (Créer)

Permet de créer de nouvelles cartes :
- Bouton "Mint Random Card"
- Affichage du cooldown (temps d'attente)
- Distribution des probabilités de rareté
- Messages de succès/erreur

#### 3. Exchange (Échanger)

Permet d'échanger des cartes avec d'autres joueurs :
- Sélection de votre carte
- Entrée de l'adresse du partenaire d'échange
- Visualisation des cartes disponibles
- Validation de l'échange

#### 4. Fuse (Fusionner)

Permet de fusionner 3 cartes :
- Sélection de 3 cartes de même rareté
- Aperçu de la rareté résultante
- Confirmation de la fusion

---

## 5. Fonctionnalités Principales

### 5.1 Mint (Créer des Cartes)

**Étapes pour mint une carte :**

1. Allez dans l'onglet "Mint"
2. Vérifiez que vous avez moins de 10 cartes
3. Assurez-vous que le cooldown est terminé
4. (Optionnel) Entrez un hash IPFS spécifique
5. Cliquez sur "Mint Random Card"
6. Confirmez la transaction dans MetaMask
7. Attendez la confirmation de Chainlink VRF
8. Votre nouvelle carte apparaîtra dans votre collection

**Caractéristiques du Minting :**
- Utilise Chainlink VRF pour un caractère aléatoire vérifiable
- Les cartes Rare+ sont automatiquement verrouillées pendant 10 minutes
- Coût : Frais de gas Ethereum + frais VRF (0.1 LINK)

### 5.2 Exchange (Échanger des Cartes)

**Étapes pour échanger une carte :**

1. Allez dans l'onglet "Exchange"
2. Sélectionnez une de vos cartes déverrouillées
3. Entrez l'adresse Ethereum de l'autre joueur
4. Cliquez sur "Load Cards" pour voir ses cartes
5. Sélectionnez la carte que vous souhaitez obtenir
6. Vérifiez que les raretés correspondent
7. Cliquez sur "Exchange Cards"
8. Confirmez la transaction dans MetaMask
9. Les cartes seront échangées instantanément

**Règles d'échange :**
- Les deux cartes doivent avoir la même rareté
- Les deux cartes doivent être déverrouillées
- Les deux joueurs doivent avoir passé leur cooldown
- L'échange est atomique (tout ou rien)

### 5.3 Fuse (Fusionner des Cartes)

**Étapes pour fusionner des cartes :**

1. Allez dans l'onglet "Fuse"
2. Sélectionnez 3 cartes de votre collection
3. Assurez-vous qu'elles ont toutes la même rareté
4. Vérifiez la rareté résultante affichée
5. (Optionnel) Entrez un hash IPFS pour la nouvelle carte
6. Cliquez sur "Fuse Cards"
7. Confirmez la transaction dans MetaMask
8. Les 3 cartes seront brûlées et une nouvelle carte de rareté supérieure sera créée

**Conversions de fusion :**
- 3 Common → 1 Rare
- 3 Rare → 1 Epic
- 3 Epic → 1 Legendary
- Les cartes Legendary ne peuvent pas être fusionnées

### 5.4 Visualiser sa Collection

Dans l'onglet "My Collection" :
- Voir toutes vos cartes en grille
- Compteur de cartes (X / 10)
- Indicateurs de verrouillage sur les cartes
- Informations détaillées sur chaque carte
- Historique des propriétaires précédents

---

## 6. Contraintes et Règles du Jeu

### Limite de Cartes

- Maximum **10 cartes** par joueur
- Si vous atteignez la limite, vous devez fusionner ou échanger des cartes pour libérer de l'espace
- Un message d'avertissement apparaît quand vous atteignez 10 cartes

### Cooldown (Temps d'Attente)

- **5 minutes** entre chaque transaction (mint, exchange, fuse)
- Le timer de cooldown s'affiche dans l'interface
- S'applique à toutes les actions du joueur
- But : éviter le spam et ajouter de la profondeur stratégique

### Verrouillage des Cartes

- Les cartes **Rare, Epic et Legendary** sont automatiquement verrouillées après leur création
- Durée du verrouillage : **10 minutes**
- Les cartes verrouillées ne peuvent pas être échangées ou fusionnées
- Indicateur 🔒 visible sur les cartes verrouillées
- Les cartes Common ne sont jamais verrouillées

### Historique des Propriétaires

- Chaque carte conserve la trace de tous ses propriétaires précédents
- Visible dans les détails de la carte
- Ajoute de la valeur de collection aux cartes ayant beaucoup voyagé
- Transparence totale de la provenance

---

## 7. Résolution des Problèmes

### Problèmes de Connexion

**MetaMask ne se connecte pas**
- Vérifiez que l'extension est installée et déverrouillée
- Rafraîchissez la page
- Videz le cache du navigateur
- Essayez avec un autre navigateur

**Mauvais réseau**
- L'application vous proposera automatiquement de changer vers Sepolia
- Ou changez manuellement dans MetaMask
- Vérifiez la configuration du réseau

### Erreurs de Transaction

**"Cooldown active"**
- Attendez la fin du cooldown (5 minutes maximum)
- Le temps restant est affiché dans l'interface

**"Maximum cards reached"**
- Vous avez 10 cartes (limite maximale)
- Fusionnez 3 cartes pour en obtenir 1
- Ou échangez une carte avec un autre joueur

**"Card is locked"**
- La carte est verrouillée pour 10 minutes
- Attendez la fin du verrouillage
- Seules les cartes Rare+ sont verrouillées

**"Insufficient LINK"**
- Le contrat n'a pas assez de tokens LINK
- Contactez l'administrateur pour ajouter du LINK
- Nécessaire pour le fonctionnement de Chainlink VRF

**"Rarity mismatch"**
- Les cartes doivent avoir la même rareté pour l'échange
- Vérifiez les niveaux de rareté
- Sélectionnez des cartes compatibles

**"Transaction rejected"**
- Vous avez rejeté la transaction dans MetaMask
- Réessayez l'opération
- Vérifiez vos frais de gas

**"Insufficient funds"**
- Pas assez d'ETH pour les frais de gas
- Obtenez plus d'ETH Sepolia depuis un faucet
- Attendez quelques minutes après la demande

### Problèmes d'Affichage

**Images des cartes ne se chargent pas**
- Vérifiez votre connexion Internet
- Les images sont hébergées sur IPFS
- Peut prendre quelques secondes à charger
- Rafraîchissez la page si nécessaire

**Interface ne répond pas**
- Rafraîchissez la page
- Vérifiez la console du navigateur (F12)
- Essayez de vous déconnecter et reconnecter

---

## 8. FAQ (Foire Aux Questions)

**Q : Combien coûte le mint d'une carte ?**  
R : Vous payez uniquement les frais de gas Ethereum. Le contrat a besoin de LINK pour Chainlink VRF, mais l'utilisateur ne paie pas directement.

**Q : Puis-je vendre mes cartes ?**  
R : Les cartes sont des NFTs ERC-721 standard. Vous pouvez les échanger dans l'application ou les vendre sur des marketplaces NFT compatibles.

**Q : Combien de temps pour recevoir ma carte après le mint ?**  
R : Généralement 1-2 minutes. Chainlink VRF génère un nombre aléatoire vérifiable, ce qui prend un peu de temps.

**Q : Puis-je fusionner des cartes de races différentes ?**  
R : Oui ! La fusion ne dépend que de la rareté, pas de la race. La race de la carte résultante sera aléatoire.

**Q : Que se passe-t-il si j'ai 10 cartes et que je veux en mint une nouvelle ?**  
R : Impossible. Vous devez d'abord fusionner 3 cartes (pour en avoir 8) ou échanger une carte avant de pouvoir mint.

**Q : Les cartes Legendary peuvent-elles être fusionnées ?**  
R : Non, Legendary est la rareté maximale. Ces cartes ne peuvent pas être fusionnées.

**Q : Comment puis-je voir l'historique complet d'une carte ?**  
R : Cliquez sur une carte dans votre collection pour voir tous les propriétaires précédents et les dates de transfert.

**Q : Puis-je annuler un échange ?**  
R : Non. Une fois la transaction confirmée sur la blockchain, l'échange est définitif et irréversible.

**Q : Est-ce que le jeu fonctionne sur mobile ?**  
R : Oui, avec MetaMask Mobile ou tout navigateur Web3 compatible mobile.

**Q : Où sont stockées les images des cartes ?**  
R : Sur IPFS (InterPlanetary File System), un système de stockage décentralisé. Cela garantit que vos cartes existeront toujours.

**Q : Puis-je transférer mes cartes vers un autre wallet ?**  
R : Oui, ce sont des NFTs standard. Utilisez MetaMask ou tout wallet compatible ERC-721 pour les transférer.

**Q : Le jeu sera-t-il disponible sur le mainnet Ethereum ?**  
R : Actuellement sur Sepolia testnet. Un déploiement mainnet dépendra du succès et de la demande.

---

## Informations Techniques

### Smart Contract

- **Adresse** : `0x317Fbed8fD8491B080f98A8e3540A6cb190908d7`
- **Réseau** : Sepolia Testnet (Chain ID: 11155111)
- **Standard** : ERC-721 (OpenZeppelin)
- **Vérification** : Vérifiable sur Sepolia Etherscan

### Technologies Utilisées

- **Frontend** : Next.js, React, Tailwind CSS
- **Web3** : ethers.js v5.7.2
- **Smart Contract** : Solidity ^0.8.20
- **Randomness** : Chainlink VRF
- **Storage** : IPFS via Pinata

### Liens Utiles

- Sepolia Etherscan : https://sepolia.etherscan.io
- Sepolia Faucet : https://sepoliafaucet.com
- Chainlink Faucet : https://faucets.chain.link/sepolia
- MetaMask : https://metamask.io
- Documentation Chainlink VRF : https://docs.chain.link/vrf

---

## Support et Contact

Pour toute question ou problème :
- Vérifiez d'abord cette documentation
- Consultez la section FAQ
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

**Équipe de Développement :**
- Smart Contracts : Jorelle Alice ETOUNDI
- Backend & IPFS : Emmanuel AKA
- Frontend & UX : Arsel DIFFO

---

*Document créé le : Janvier 2026*  
*Version : 1.0*  
*Dernière mise à jour : Janvier 2026*
