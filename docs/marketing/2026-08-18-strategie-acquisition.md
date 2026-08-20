# Stratégie d'acquisition Biume — décisions du 18 août 2026

## Statut du document

Ce document fixe la stratégie marketing et commerciale de Biume jusqu'au 30 novembre 2026.

Il distingue les **faits vérifiés** (marché, dépôt, concurrence, sources citées) des **hypothèses** (taux de conversion), qui restent à confirmer par les premières conversations. Aucune décision de ce document ne repose sur une projection non signalée comme telle.

Il remplace, pour la période, le `docs/seo/2026-07-03-plan-editorial-seo.md` comme document directeur de l'acquisition.

---

## 1. Diagnostic

### 1.1 Le canal d'acquisition était le mauvais

L'acquisition de Biume a été construite pour Google : six pages d'acquisition (`/logiciel-osteopathe-animalier`, `/compte-rendu-osteopathe-animalier`, `/tarifs`, `/comparatifs`, longues traînes, blog), fondations techniques complètes, plan éditorial.

Les acheteurs ne sont pas sur Google. Ils sont sur **Instagram et Facebook**, où ils communiquent déjà vers les propriétaires d'animaux.

Le SEO reste un actif : il produit des impressions et a déjà généré une inscrite qualifiée. Il est **conservé, plus développé**.

### 1.2 Le marché est fini, donc énumérable

| Source | Praticiens recensés |
|---|---|
| Registre National CNOV (début 2025) | moins de 1 000 |
| Annuaire PointOsteo | **chiffre invalidé** — voir 1.2 bis |
| Étude démographique COA (2021-2022) | 1 462, dont 888 exclusifs |
| Estimations larges | jusqu'à 3 000 |

Conséquence directe : le SEO est un levier de volume appliqué à un marché sans volume. Même en position 1 sur toutes les requêtes, le trafic capté reste marginal.

Le contact direct reste la seule stratégie rationnelle sur un marché de cette taille, et c'est un travail qui se termine. En revanche, la liste n'est **pas** disponible clé en main : voir ci-dessous.

### 1.2 bis — L'annuaire PointOsteo ne contient pas 842 praticiens

Vérifié le 18 août 2026. La page d'accueil de point-osteo.fr annonce « 842 praticiens ». Son API publique `https://point-osteo.fr/api/annuaire/tous-professionnels` répond 200 avec **3 enregistrements**, dont un SIRET manifestement fictif et deux comptes en plan gratuit.

Conséquences :

- Le chiffre de 842 est un argument commercial, pas un recensement. Il ne doit plus être cité.
- **Il n'existe pas de liste de contacts prête à l'emploi.** La liste de prospection est à construire par le canal retenu (Instagram, Facebook, écoles), pas à extraire d'un annuaire.
- Les seuls chiffres de marché fiables restent ceux de l'étude COA (1 462) et du registre CNOV (moins de 1 000), qui sont des sources indépendantes.
- PointOsteo commercialise des plans `agenda-pro` et `business` auprès d'ostéopathes animaliers : c'est un acteur du marché qui revendique 842 utilisateurs et en compte 3. **Les sept concurrents recensés en 3.2 méritent le même examen** — le marché est peut-être nettement plus vide qu'il n'y paraît, ce qui serait une bonne nouvelle.
- Note technique : l'endpoint `/api/annuaire/marechaux/{id}` expose sans authentification l'e-mail, le téléphone, le SIRET, le plan d'abonnement et les compteurs d'analytics internes de chaque inscrit. Données à ne pas exploiter.

### 1.3 Le motif à corriger

Deux produits, 621 commits, aucun revenu récurrent :

| | Dunlo | Biume |
|---|---|---|
| Commits | 256 | 365 |
| Période | 3 juin → 17 juil. 2026 | 27 juil. → 17 août 2026 |
| Marketing produit | audit SEO, refonte landing | 5 refontes de landing, `landing-v2` à `landing-v5`, 5 composants pricing |
| Revenu récurrent | — | proche de zéro |
| Issue | abandonné | en cours |

Le réflexe documenté : quand la conversation arrive au moment de demander de l'argent, la solution qui apparaît est de construire davantage. La refonte de landing est la tâche qui ressemble le plus à de la vente sans en être.

**Correctif retenu :** un critère d'arrêt chiffré et daté, et des règles de discipline (section 7).

---

## 2. Le positionnement

Biume s'adresse à des praticiens **nomades**, pas à des cabinets. L'ostéopathe animalier se déplace : écurie, pré, ferme, domicile. Il n'y a ni salle d'attente, ni patientèle qui vient à lui.

Toute formulation empruntée au soin humain sédentaire — « cabinet », « salle d'attente », « multi-praticiens » — est à proscrire.

La landing v5 respecte déjà ce positionnement :

> « La séance finit dans la voiture. »
> « Entre deux rendez-vous, sur un téléphone, après la dernière séance. »

**Conséquence produit :** pour un praticien en déplacement permanent, l'application mobile n'est pas un complément. C'est le lieu principal d'usage. Le web est l'atelier du soir — précisément l'endroit où il ne veut plus être.

---

## 3. Le plafond de Biume, et ce qu'il implique

### 3.1 Calcul

Prix actuel : 29,99 €/mois en mensuel, 24,99 €/mois en annuel (299,88 € facturés en une fois).

| Pénétration du marché | Abonnés | Revenu mensuel |
|---|---|---|
| 10 % — déjà un franc succès | ~150 | **3 700 €** |
| 20 % — leader incontesté | ~290 | **7 300 €** |
| 30 % — domination totale | ~440 | 11 000 € |

**Biume est un business à 4–7 k€/mois.** Ce n'est pas un défaut d'exécution, c'est une contrainte arithmétique du marché français.

### 3.2 Le prix est verrouillé par la concurrence, pas par la valeur

Concurrents recensés dans le dépôt (`apps/marketing/app/alternatives/`) : `neovoice`, `hunimalis`, `mypawscribe`, `animalib`, `stenko`, `kiwiappli`, `mytour`. Sept outils sur 1 400 praticiens, tous à 25 € ou moins, plusieurs gratuits.

Le même geste produit — dictée vocale vers compte rendu clinique structuré — se vend nettement plus cher un cran à côté :

| Référence | Prix |
|---|---|
| Scribenote (scribe IA vétérinaire) | 79 $/mois annuel, 99 $/mois mensuel |
| Catégorie « veterinary AI scribe » | 12 outils, de 40 $ à 450 $/mois |

**Conclusion : le levier n'est pas le prix, c'est le marché.** Augmenter le tarif chez les ostéopathes animaliers français est impossible ; porter le même moteur ailleurs le rend possible. Voir section 9.

---

## 4. Décisions de pricing

- **Le prix ne change pas jusqu'au 30 novembre 2026.** Le combat tarifaire n'est pas celui de ce trimestre ; la preuve de vente l'est.
- **Une seule formule.** Un marché de 1 400 solos nomades avec sept concurrents à 25 € ne supporte pas de grille à paliers. L'idée d'un escalier tarifaire (Séance / Cabinet / Praticien+) est **écartée**.
- **Mettre en avant le mensuel, pas l'annuel.** Demander 299,88 € payés en une fois à un praticien qui n'a jamais acheté de logiciel est un frein de conversion majeur. L'objectif est 25 cartes bancaires, pas 25 engagements annuels.
- **Argument de clôture, vrai et utilisable :** « les 25 premiers gardent 29,99 € à vie ; le tarif passera ensuite. » Donne une raison de signer maintenant plutôt que « j'y réfléchis ».

---

## 5. Canal d'acquisition

**Canal principal : Instagram et Facebook.** Contact direct, messages personnalisés, groupes professionnels.

**Canaux secondaires à activer ensuite :**
- Écoles de formation en ostéopathie animale — une négociation touche une promotion entière de nouveaux installés, au moment exact où ils choisissent leurs outils.
- Annuaires professionnels (PointOsteo, annuaire-osteopathie-animaux).
- Bouche-à-oreille — déterminant dans une profession de 1 400 personnes qui se connaissent.

**SEO :** maintenu, non développé. Aucune nouvelle page, aucune refonte.

### Entonnoir de référence — hypothèses à vérifier, pas à croire

| Étape | Taux supposé | Volume |
|---|---|---|
| Praticiens joignables sur IG/FB | ~50 % de 1 400 | 700 |
| Réponse à un message personnalisé | 20–30 % | 140–210 |
| Acceptent un échange ou une démonstration | 25–40 % | 35–85 |
| Souscrivent | 20–35 % | **10–25** |

Ces taux doivent être remplacés par les taux réels après les deux premières semaines de contact.

**Ressource déjà en place et inutilisée :** le lien de réservation `cal.com` présent sur la landing — « trente minutes, votre dernière séance comme exemple, et vous repartez avec un compte rendu prêt à envoyer ». Offre de démonstration excellente, opérationnelle, à envoyer.

---

## 6. État de la landing — verdict

La landing v5 a été auditée section par section contre la surface réelle du produit. **Elle n'a pas besoin d'être modifiée.**

Toutes les modifications envisagées ont été écartées après vérification :

| Modification envisagée | Verdict |
|---|---|
| Renommer autour du « cabinet » | Écartée — mauvais métier, les praticiens sont nomades |
| Mettre en avant le multi-praticiens | Écartée — sans objet pour des solos |
| Introduire des paliers tarifaires | Écartée — marché trop petit |
| Mettre en avant l'assistant | Écartée — `dashboard/assistant.tsx` lève `notFound()` hors DEV : la fonctionnalité est **désactivée en production** |
| Ajouter des témoignages | Reportée — aucun témoignage disponible, et `content.ts` interdit toute preuve inventée |

**Le seul manque réel n'est pas dans le texte mais dans la livraison :** la landing promet « le terrain dans la poche » alors que `apps/mobile` est en version 0.1.0 avec `submit.production` vide dans `eas.json`. Si l'application n'est pas installable, le produit vendu à un métier nomade reste un logiciel de bureau.

---

## 7. Règles de discipline

1. **Aucune fonctionnalité n'est développée avant que 5 utilisateurs l'aient nommée d'eux-mêmes.**
2. **Aucun nouveau dépôt, aucun produit n°2 avant le 30 novembre 2026.**
3. **Aucune refonte de landing.** La landing est jugée conforme (section 6).
4. **Aucune nouvelle page SEO.**
5. **Aucune preuve inventée** — règle déjà inscrite en tête de `landing-v5/content.ts`, maintenue.
6. Exception unique à la règle 1 : **publier l'application mobile** n'est pas une nouvelle fonctionnalité, c'est la livraison d'une fonctionnalité existante à l'endroit où le métier se pratique.

---

## 8. Plan d'action

### Vérifications techniques — cette semaine

- [ ] **`autumn.config.ts` : les six fonctionnalités booléennes sont déclarées `included: 0` dans les deux plans.** Sur une feature booléenne, `0` se lit comme faux. À vérifier avec un compte de test souscrit : si les droits ne s'ouvrent pas, un client payant ne reçoit rien. `autumn.config.test.ts` ne couvre que la politique d'essai, aucun droit n'est testé.
- [ ] **Statut de l'application mobile.** Installable par un praticien, ou build interne ? Décide de tout le reste du trimestre.
- [ ] **Assistant** : soit la fonctionnalité est activée en production, soit elle est retirée du périmètre commercial. Elle ne peut pas rester dans un état intermédiaire.

### Action commerciale — immédiate

- [ ] **Contacter l'inscrite qualifiée venue du SEO.** Elle s'est inscrite sans utiliser le produit. C'est l'actif le plus précieux à cet instant : elle détient la réponse à « qu'est-ce qui manque pour payer ». Un message coûte quelques minutes et remplit trois fonctions à la fois — acte de vente, recherche produit, jugement de marché.
- [ ] Reprendre contact avec l'ensemble des utilisateurs gratuits existants. Conversion la moins chère disponible : ils connaissent déjà le produit.
- [ ] Constituer la liste de contact directement sur Instagram et Facebook : recherche par hashtags (`#osteopatheanimalier`, `#osteopathieanimale` et variantes équines et canines), puis descente du graphe d'abonnements — ces praticiens se suivent entre eux. Compléter par les annuaires d'anciens élèves des écoles et par le registre CNOV. Ne pas compter sur les annuaires commerciaux (voir 1.2 bis).

### Questions à poser dans chaque conversation

Ces réponses remplacent les hypothèses de la section 5 et fondent la future grille tarifaire :

1. Quel outil utilisez-vous aujourd'hui pour vos comptes rendus, et combien le payez-vous ?
2. Combien de temps vous prend un compte rendu, et à quel moment de la journée le rédigez-vous ?
3. Qu'est-ce qui vous a empêché d'utiliser Biume après votre inscription ?
4. Qu'est-ce qui manquerait pour que ça vaille votre abonnement ?

### Objectif

**25 abonnés payants au 30 novembre 2026.**

Soit environ 2 % du marché français — modeste et atteignable. C'est un objectif d'apprentissage autant que de revenu : il valide la capacité à transformer un utilisateur en client, compétence en cours d'acquisition via la formation au closing.

### Indicateurs suivis chaque semaine

À suivre à la place du nombre de commits :

- Conversations engagées sur Instagram et Facebook
- Réponses obtenues
- Démonstrations réalisées
- Abonnés payants
- Témoignages collectés

---

## 9. Après le 30 novembre

Biume est une **rente** : 4–7 k€/mois, marché fini, prix plafonné. C'est un revenu qui finance la suite, et un terrain d'entraînement commercial. Ce n'est pas un business à 30 k€/mois, et il n'a pas à le devenir.

L'objectif à 30 k€/mois passe par le même moteur — capture vocale, transcription, structuration, compte rendu, suivi — porté sur une profession où la catégorie se paie 79 à 99 $ au lieu de 25 €, avec un marché de deux ordres de grandeur supérieur. Les briques réutilisables existent déjà : `apps/mobile`, `packages/transactional`, `packages/db`, `packages/contracts`, `packages/ui`.

**L'ordre n'est pas négociable : d'abord 25 payants, ensuite le changement de marché.** Porter le moteur ailleurs sans avoir appris à conclure une vente ne produirait qu'un troisième produit invendu, à 79 $ cette fois.

### Piste écartée

L'analyse Beatable « White-Label AI Agent Platform » (score 78, SAM 1,2 Md$) est **écartée**. Le modèle exige une vente directe à 149–1 499 $/mois avec 500 à 1 500 $ de frais de mise en service, face à HighLevel (30 % de part, entrée à 97 $/mois) et à Dify (open source, édition communautaire gratuite). Le rapport identifie lui-même son risque principal sans y répondre : rien n'explique pourquoi une agence paierait une plateforme dédiée plutôt que d'assembler des outils génériques. Ce modèle requiert exactement la compétence manquante et aucune de celles acquises.

---

## Sources

- [Étude démographique des Ostéopathes Animaliers — Collectif OA](https://www.collectif-osteopathes-animaliers.fr/etude-demographique-des-osteopathes-animaliers/)
- [PointOsteo — annuaire des ostéopathes animaliers](https://point-osteo.fr/) — *chiffre de 842 praticiens invalidé, voir 1.2 bis*
- [Scribenote — grille tarifaire](https://scribenote.com/pricing)
- [Veterinary AI Scribe Pricing 2026 — 12 outils, 40 $ à 450 $/mois](https://www.vetsoftwarehub.com/article/veterinary-ai-scribe-pricing-comparison-2026)
- Analyse Beatable — White-Label AI Agent Platform (https://beatable.co/analysis/6A4B1F2532)
