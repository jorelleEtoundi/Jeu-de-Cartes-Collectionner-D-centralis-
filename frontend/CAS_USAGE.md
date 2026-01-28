# Présentation du Cas d'Usage - Andromeda Protocol

**Projet** : Jeu de Cartes à Collectionner Décentralisé  
**Équipe** :
- Jorelle Alice ETOUNDI - Smart Contracts & Tests
- Emmanuel AKA - Backend & IPFS
- Arsel DIFFO - Frontend & DApp

**Date** : Janvier 2026

---

## 1. Contexte et Motivation

### 1.1 Problématique

Les jeux de cartes à collectionner traditionnels (physiques et numériques centralisés) présentent plusieurs limitations :

**Problèmes des cartes physiques** :
- Risque de perte ou détérioration
- Contrefaçons difficiles à détecter
- Échanges limités géographiquement
- Pas de preuve de propriété numérique
- Fraudes lors des ventes

**Problèmes des jeux centralisés** :
- Propriété non réelle (compte peut être fermé)
- Marketplace contrôlée par l'éditeur
- Valeurs manipulables
- Arrêt du jeu = perte totale des collections
- Pas d'interopérabilité entre jeux

### 1.2 Solution Blockchain

La blockchain offre une solution à ces problèmes :
- **Propriété véritable** : Les NFTs appartiennent réellement au joueur
- **Immuabilité** : Historique transparent et inaltérable
- **Décentralisation** : Pas de point de défaillance unique
- **Interopérabilité** : Compatible avec tous les wallets et marketplaces
- **Transparence** : Rareté vérifiable on-chain

---

## 2. Description du Cas d'Usage

### 2.1 Univers Narratif

**Année 2500 - La Galaxie d'Andromède**

Sept civilisations aliens ont formé le Conseil Galactique pour maintenir la paix dans la galaxie d'Andromède. Pour faciliter les échanges commerciaux et culturels, elles ont créé le **Protocole Andromède** - un système décentralisé de tokenisation des vaisseaux spatiaux.

Les joueurs incarnent des **Commandants** qui collectionnent des cartes représentant les vaisseaux légendaires de chaque race. Chaque carte est unique, avec sa propre histoire et ses anciens propriétaires tracés on-chain.

### 2.2 Les Sept Races

Chaque race a ses caractéristiques propres :

**1. Humans (Humains)**
- Origine : Terre
- Spécialité : Innovation technologique
- Style : Vaisseaux polyvalents et adaptables

**2. Zephyrs**
- Origine : Dimension énergétique
- Spécialité : Téléportation
- Style : Vaisseaux cristallins lumineux

**3. Kraths**
- Origine : Planète volcanique
- Spécialité : Combat rapproché
- Style : Cuirassés blindés

**4. Preservers (Préservateurs)**
- Origine : Stations orbitales anciennes
- Spécialité : Sagesse et diplomatie
- Style : Vaisseaux bio-organiques

**5. Synthetics**
- Origine : Évolution IA
- Spécialité : Calcul et précision
- Style : Vaisseaux modulaires interconnectés

**6. Aquarians**
- Origine : Océans spatiaux
- Spécialité : Navigation fluide
- Style : Vaisseaux hydrodynamiques

**7. Ancients (Anciens)**
- Origine : Civilisation disparue
- Spécialité : Technologie mystique
- Style : Artefacts incompréhensibles

### 2.3 Système de Rareté

Le système utilise 4 niveaux de rareté, chacun représentant la puissance et la légendairité du vaisseau :

**Common (70%)** - Vaisseaux standards
- Valeur : 100
- Description : Vaisseaux de base, fiables
- Couleur : Gris

**Rare (20%)** - Vaisseaux améliorés
- Valeur : 300
- Description : Versions optimisées avec technologie avancée
- Couleur : Bleu

**Epic (8%)** - Vaisseaux de commandement
- Valeur : 700
- Description : Navires-amiraux des flottes
- Couleur : Violet

**Legendary (2%)** - Vaisseaux légendaires
- Valeur : 1000
- Description : Artefacts uniques de légendes galactiques
- Couleur : Or

---

## 3. Justification de l'Usage de la Blockchain

### 3.1 Nécessité de la Décentralisation

**Propriété véritable** :
- Les NFTs garantissent que le joueur possède réellement ses cartes
- Aucune entité ne peut retirer ou modifier les cartes sans permission
- Le wallet du joueur = coffre-fort inviolable

**Transparence** :
- Rareté vérifiable : On peut prouver qu'il n'y a que 2% de Legendary
- Historique complet : Chaque transaction est tracée
- Équité garantie : Le caractère aléatoire est vérifiable (Chainlink VRF)

**Interopérabilité** :
- Les cartes sont des NFTs ERC-721 standard
- Utilisables sur OpenSea, Rarible, etc.
- Transférables entre wallets
- Potentiel d'utilisation dans d'autres jeux

**Pérennité** :
- Les cartes existent indépendamment du jeu
- Métadonnées sur IPFS (décentralisé)
- Même si le frontend disparaît, les NFTs restent

### 3.2 Smart Contracts vs Backend Traditionnel

**Pourquoi pas un backend classique ?**

Avec un serveur centralisé :
- ❌ L'éditeur contrôle tout
- ❌ Possibilité de fermeture du service
- ❌ Risque de manipulation des données
- ❌ Propriété illusoire
- ❌ Frais de serveur continus

Avec des smart contracts :
- ✅ Code open-source et auditable
- ✅ Règles immuables et automatiques
- ✅ Pas de maintenance serveur
- ✅ Propriété cryptographiquement garantie
- ✅ Transactions peer-to-peer sans intermédiaire

---

## 4. Mécaniques de Jeu et Contraintes

### 4.1 Mint (Création)

**Processus** :
1. Le joueur paie les frais de gas
2. Chainlink VRF génère un nombre aléatoire sécurisé
3. Le contrat détermine la race et la rareté
4. Un NFT unique est créé et attribué au joueur

**Contraintes implémentées** :
- Maximum 10 cartes par joueur (gestion de la rareté)
- Cooldown de 5 minutes entre actions (anti-spam)
- Lock de 10 minutes sur les cartes Rare+ (anti-flip immédiat)

**Justification** :
- Limite à 10 : Force les joueurs à être stratégiques
- Cooldown : Évite la saturation de la blockchain
- Lock : Valorise les cartes rares en empêchant la revente immédiate

### 4.2 Exchange (Échange)

**Processus** :
1. Le joueur A sélectionne une de ses cartes
2. Le joueur B sélectionne une de ses cartes
3. Les deux cartes doivent avoir la même rareté
4. L'échange est atomique (tout ou rien)
5. L'historique des propriétaires est mis à jour

**Contraintes** :
- Même rareté requise (équité)
- Cartes déverrouillées uniquement
- Respect du cooldown

**Justification** :
- Échange peer-to-peer sans marketplace centralisée
- Rareté équitable : pas d'arnaque Common contre Legendary
- Transparence totale de l'historique

### 4.3 Fuse (Fusion)

**Processus** :
1. Le joueur sélectionne 3 cartes de même rareté
2. Les 3 cartes sont brûlées (détruites)
3. Une nouvelle carte de rareté supérieure est créée
4. La race de la nouvelle carte est aléatoire

**Conversions** :
- 3 Common → 1 Rare
- 3 Rare → 1 Epic
- 3 Epic → 1 Legendary

**Justification** :
- Crée une économie déflationniste (3 → 1)
- Augmente la valeur des cartes rares
- Encourage la stratégie : Quand fusionner ?
- Aléatoire : La race n'est pas garantie, ajoutant du suspense

---

## 5. Avantages Compétitifs

### 5.1 vs Jeux de Cartes Physiques

| Critère | Cartes Physiques | Andromeda Protocol |
|---------|------------------|-------------------|
| Propriété | Peut être volée/perdue | Sécurisée par cryptographie |
| Contrefaçon | Difficile à détecter | Impossible (blockchain) |
| Échange | Local uniquement | Global, instantané |
| Historique | Absent | Complet et vérifiable |
| Stockage | Espace physique requis | Wallet numérique |
| Valeur | Subjective | Transparente on-chain |

### 5.2 vs Jeux de Cartes Numériques Centralisés

| Critère | Hearthstone / Magic Arena | Andromeda Protocol |
|---------|--------------------------|-------------------|
| Propriété | Compte (pas le joueur) | NFT (le joueur) |
| Marketplace | Contrôlée par l'éditeur | Décentralisée |
| Transparence | Opaque | Totale |
| Pérennité | Dépend de l'éditeur | Indépendante |
| Interopérabilité | Aucune | Standard NFT |
| Valeur | Manipulable | Déterminée par le marché |

### 5.3 Proposition de Valeur Unique

**Pour les joueurs** :
- Propriété réelle des actifs numériques
- Possibilité de revente sur le marché secondaire
- Transparence totale sur les probabilités
- Collection pérenne

**Pour les collectionneurs** :
- Rareté vérifiable
- Historique complet
- Authenticité garantie
- Potentiel d'appréciation

**Pour l'écosystème** :
- Open-source et auditable
- Pas de point de défaillance unique
- Interopérable avec l'écosystème NFT
- Communauté autonome possible

---

## 6. Modèle Économique

### 6.1 Tokenomics

**Supply (Offre)** :
- Potentiellement illimité (mint ouvert)
- Mais limité par :
  - Maximum 10 cartes/joueur
  - Fusion déflationniste (3 → 1)
  - Coût des gas fees

**Demand (Demande)** :
- Collectionneurs de NFTs
- Joueurs cherchant des cartes spécifiques
- Investisseurs anticipant l'appréciation

**Prix** :
- Marché secondaire (OpenSea, etc.)
- Déterminé par l'offre et la demande
- Legendary naturellement plus cher

### 6.2 Mécanismes Déflationnistes

**Fusion** :
- Brûle 3 cartes pour en créer 1
- Réduit l'offre totale
- Augmente la rareté relative

**Limite par joueur** :
- Empêche l'accumulation excessive
- Force la circulation des cartes

**Lock des cartes rares** :
- Empêche le flip immédiat
- Stabilise les prix

### 6.3 Monétisation Potentielle

**Pour l'équipe** (futur) :
- Frais sur marketplace intégrée (2-5%)
- Royalties sur reventes secondaires (5-10%)
- Cartes promotionnelles spéciales
- Événements payants

**Pour les joueurs** :
- Achat/vente sur marketplace
- Échange de cartes
- Participation aux tournois (futur)

---

## 7. Roadmap et Évolution

### 7.1 Phase 1 : MVP (Actuel)

✅ Fonctionnalités implémentées :
- Smart contract ERC-721
- Mint avec Chainlink VRF
- Échange peer-to-peer
- Fusion de cartes
- Frontend Web3
- Métadonnées IPFS

### 7.2 Phase 2 : Marketplace (Futur)

🔄 Fonctionnalités prévues :
- Marketplace intégrée
- Achat/vente avec ETH
- Système d'enchères
- Graphiques de prix
- Historique des ventes

### 7.3 Phase 3 : Gameplay (Futur)

🔮 Fonctionnalités envisagées :
- Batailles entre cartes
- Tournois compétitifs
- Classements
- Récompenses
- Achievements

### 7.4 Phase 4 : Metaverse (Vision)

🌟 Vision long terme :
- Intégration dans metaverses (Decentraland, Sandbox)
- Affichage 3D des vaisseaux
- Utilisation dans d'autres jeux
- Gouvernance DAO

---

## 8. Risques et Mitigation

### 8.1 Risques Techniques

**Gas fees élevés sur mainnet**
- Mitigation : Déployé sur Layer 2 (Polygon, Arbitrum)
- Alternative : Sidechains (BSC, Avalanche)

**Centralisation d'IPFS**
- Mitigation : Multiples gateways
- Alternative : Arweave pour stockage permanent

**Smart contract bugs**
- Mitigation : Audits professionnels
- Tests unitaires complets
- Bug bounty program

### 8.2 Risques Économiques

**Manipulation du marché**
- Mitigation : Limite de cartes par joueur
- Cooldowns
- Transparence totale

**Baisse d'intérêt**
- Mitigation : Updates régulières
- Événements communautaires
- Nouvelles fonctionnalités

**Compétition**
- Mitigation : Focus sur la qualité
- Communauté engagée
- Partenariats stratégiques

### 8.3 Risques Réglementaires

**Législation NFT incertaine**
- Mitigation : Veille juridique
- Conformité proactive
- Transparence totale

**Classification comme jeu d'argent**
- Mitigation : Pas de casino mechanics
- Skill-based gameplay
- Clarté sur la nature du jeu

---

## 9. Impact et Valeur Ajoutée

### 9.1 Innovation Technique

- **Chainlink VRF** : Caractère aléatoire vérifiable
- **IPFS** : Stockage décentralisé
- **ERC-721** : Standard NFT interopérable
- **Web3** : Frontend décentralisé

### 9.2 Valeur Éducative

Le projet démontre :
- L'utilité réelle de la blockchain
- Les smart contracts en pratique
- Les NFTs au-delà du hype
- La décentralisation concrète

### 9.3 Contribution à l'Écosystème

- Code open-source
- Documentation complète
- Patterns réutilisables
- Cas d'étude pour d'autres projets

---

## 10. Conclusion

Andromeda Protocol démontre que la blockchain n'est pas qu'une mode, mais une technologie qui apporte des solutions concrètes aux problèmes réels des jeux de cartes à collectionner :

✅ **Propriété véritable** : Les joueurs possèdent vraiment leurs cartes  
✅ **Transparence** : Rareté et historique vérifiables  
✅ **Équité** : Caractère aléatoire prouvable  
✅ **Pérennité** : Les cartes existent indépendamment du jeu  
✅ **Interopérabilité** : Compatible avec l'écosystème NFT

Le cas d'usage est justifié car :
1. La blockchain résout de vrais problèmes
2. La décentralisation apporte une valeur unique
3. Les smart contracts automatisent les règles équitablement
4. Les NFTs créent une propriété véritable

Ce n'est pas "blockchain pour la blockchain", mais blockchain parce qu'elle est la meilleure solution pour ce cas d'usage.

---

**Équipe Andromeda Protocol**  
*L'avenir du commerce galactique est décentralisé* 🌌

Janvier 2026
