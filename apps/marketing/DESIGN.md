---
name: Biume Marketing
description: Une mécanique douce qui transforme les notes du praticien en un suivi clair pour le propriétaire.
colors:
  decision-violet: "#6B5AC8"
  decision-violet-soft: "#EEEBFB"
  connection-blue: "#5D9BB8"
  connection-blue-soft: "#E8F1F5"
  validation-green: "#2E9866"
  validation-green-ink: "#21734D"
  validation-green-soft: "#E7F3ED"
  canvas: "#F7F7F4"
  surface: "#FDFDFB"
  muted-surface: "#ECECE7"
  ink: "#1D1D21"
  muted-ink: "#696970"
  line: "#DEDED7"
  anthracite: "#202024"
  logo-violet: "#8E82E8"
  logo-blue: "#62A8C8"
  logo-green: "#28C978"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 650
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  functional:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.02em"
rounded:
  control: "10px"
  surface: "16px"
  media: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  section-sm: "64px"
  section-md: "96px"
components:
  button-primary:
    backgroundColor: "{colors.decision-violet}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "48px"
  status-validated:
    backgroundColor: "{colors.validation-green-soft}"
    textColor: "{colors.validation-green-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  product-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: Biume Marketing

## 1. Overview

**Creative North Star: "La mécanique douce"**

Biume donne une forme visible à un travail habituellement dispersé : observer, noter, reformuler, valider et suivre. Le système doit faire penser à une mécanique précise que l'on comprend en la regardant fonctionner, mais dont chaque mouvement reste calme, humain et maîtrisé par le praticien.

La landing est vivante, ingénieuse et rassurante. Elle utilise les couleurs existantes avec davantage d'amplitude, varie franchement la composition des sections et fait du produit sa principale preuve. Elle rejette les conventions d'une landing SaaS générique, l'imagerie clinique, les codes enfantins des marques pour animaux, la surenchère autour de l'IA et toute copie littérale de Clay.

**Key Characteristics:**

- Démonstrations produit lisibles comme des transformations, pas comme des captures décoratives.
- Violet, bleu et vert employés selon des rôles stables et compréhensibles.
- Rythme narratif variable, avec une idée dominante par séquence.
- Formes tactiles et mouvement précis, sans effet jouet.
- Contrôle du praticien rendu visible à chaque étape importante.

## 2. Colors

La palette conserve l'identité historique de Biume et attribue à chaque accent un rôle narratif strict.

### Primary

- **Violet de décision** (`#6B5AC8`) : actions principales, choix actifs, focus et moments où le praticien garde la main.
- **Violet de décision doux** (`#EEEBFB`) : fond de sélection ou de mise en contexte, jamais décor omniprésent.

### Secondary

- **Bleu de liaison** (`#5D9BB8`) : circulation entre les notes, le compte rendu et le suivi.
- **Bleu de liaison doux** (`#E8F1F5`) : zones intermédiaires, étapes et relations entre objets.

### Tertiary

- **Vert de validation** (`#2E9866`) : états confirmés, envoyés ou reçus uniquement.
- **Vert de validation profond** (`#21734D`) : texte accessible sur les fonds verts doux.
- **Vert de validation doux** (`#E7F3ED`) : fond d'état confirmé.

### Neutral

- **Blanc atelier** (`#F7F7F4`) : toile principale claire, neutre et légèrement liée à la marque.
- **Surface nette** (`#FDFDFB`) : outils, documents et contrôles qui doivent ressortir du fond.
- **Surface de travail** (`#ECECE7`) : regroupements secondaires et champs inactifs.
- **Anthracite précis** (`#1D1D21`) : texte principal et structure à contraste élevé.
- **Encre secondaire** (`#696970`) : explications et métadonnées, avec contraste AA vérifié.
- **Trait discret** (`#DEDED7`) : séparateurs et contours structurels.
- **Anthracite profond** (`#202024`) : séquences sombres ponctuelles et surfaces de contraste.
- **Violet, bleu et vert du logo** (`#8E82E8`, `#62A8C8`, `#28C978`) : réservés au logo et aux compositions de marque explicitement tricolores.

**The Semantic Color Rule.** Le violet décide, le bleu relie, le vert confirme. Aucun accent n'est utilisé au hasard pour embellir une section.

**The Green Means Done Rule.** Le vert est interdit pour une promesse, une décoration ou un état non confirmé.

## 3. Typography

**Display Font:** Hanken Grotesk (avec pile sans-serif système de secours).
**Body Font:** Hanken Grotesk (avec pile sans-serif système de secours).
**Label/Mono Font:** pile monospace système, réservée aux valeurs réellement fonctionnelles.

**Character:** Une voix directe, souple et précise. La hiérarchie vient de l'échelle, de la densité et du rythme, pas d'un mélange éditorial de sérif italique et de petites étiquettes techniques.

### Hierarchy

- **Display** (650, `clamp(3rem, 6vw, 6rem)`, 0.92) : promesse principale, avec un interlettrage jamais inférieur à `-0.04em`.
- **Headline** (650, `clamp(2.25rem, 4.5vw, 4.5rem)`, 1) : changement de chapitre et idée dominante d'une séquence.
- **Title** (600, `1.25rem–1.75rem`, 1.2) : titre d'un outil, d'une étape ou d'une démonstration.
- **Body** (400, `1rem–1.125rem`, 1.65) : explication, limitée à environ 70 caractères par ligne.
- **Functional** (600, `0.75rem`, `0.02em`) : prix, date, statut et valeur mesurable. Jamais comme costume technique.

**The One Clear Voice Rule.** Les titres et le corps utilisent la même logique sans-serif. Le contraste vient de l'échelle et de la composition, pas d'un effet magazine.

**The Functional Mono Rule.** La monospace est interdite pour les accroches de section répétitives ; elle n'apparaît que lorsque la donnée est réellement fonctionnelle.

## 4. Elevation

Le système est structurellement superposé. Les grands aplats et les relations spatiales créent la profondeur ; les ombres courtes sont réservées aux éléments produit manipulables ou momentanément élevés. Une surface bordée reste plate et une surface élevée n'ajoute pas un contour décoratif.

### Shadow Vocabulary

- **Manipulation légère** (`0 4px 8px rgba(29, 29, 33, 0.14)`) : menu ouvert, aperçu déplacé ou outil en interaction.
- **Focus produit** (`0 6px 8px rgba(107, 90, 200, 0.16)`) : élément produit important sans contour simultané.

**The Structural Layering Rule.** Une ombre doit expliquer qu'un objet flotte ou bouge. Si elle ne porte aucune information, elle est supprimée.

**The Border Or Shadow Rule.** Une même surface n'utilise jamais une bordure décorative et une large ombre douce en même temps.

## 5. Components

Les composants sont tactiles, francs et légèrement ludiques. Ils doivent sembler manipulables sans basculer dans un univers enfantin.

### Buttons

- **Shape:** pilule (`9999px`) pour les actions marketing ; hauteur minimale de `48px`.
- **Primary:** violet de décision, texte blanc, `14px 24px`, libellé direct.
- **Hover / Focus:** déplacement vertical maximal de `2px`, focus visible de `2px` avec décalage de `2px`, easing de sortie exponentiel.
- **Secondary:** surface nette, texte anthracite, contour structurel d'un pixel, sans ombre.

### Chips

- **Style:** pilule compacte ; fond tonal et texte de la même famille chromatique.
- **State:** le vert est réservé aux états réellement validés. Les filtres et catégories utilisent violet, bleu ou neutre.

### Cards / Containers

- **Corner Style:** courbe modérée (`16px`) ; les médias dominants peuvent atteindre `24px`.
- **Background:** surface nette ou aplat de marque explicite.
- **Shadow Strategy:** plate par défaut ; ombre courte uniquement en état élevé.
- **Border:** trait discret d'un pixel lorsque la séparation structurelle est nécessaire.
- **Internal Padding:** `16px` à `32px` selon la densité de l'outil.

### Inputs / Fields

- **Style:** hauteur minimale de `44px`, fond net, rayon de `10px`, contour structurel d'un pixel.
- **Focus:** contour violet de décision et anneau visible, sans glow diffus.
- **Error / Disabled:** l'état reste lisible par le texte et la forme, jamais par la couleur seule.

### Navigation

La navigation reste compacte, sémantique et centrée sur le parcours. Les liens utilisent le texte secondaire au repos, l'anthracite au survol et un focus violet visible. Sur mobile, le menu doit s'échapper des conteneurs susceptibles de le rogner et conserver des cibles d'au moins `44px`.

### Transformation produit

La démonstration signature relie visuellement trois objets : notes du praticien, proposition structurée, suivi propriétaire. Le bleu matérialise le passage, le violet les décisions et le vert uniquement l'issue validée. L'ensemble doit être compréhensible avant toute animation.

## 6. Do's and Don'ts

### Do:

- **Do** conserver exactement le violet `#6B5AC8`, le bleu `#5D9BB8` et le vert `#2E9866` dans leurs rôles sémantiques.
- **Do** montrer des transformations produit fidèles comme principale preuve tant qu'aucun témoignage ou chiffre validé n'existe.
- **Do** alterner les compositions et les densités pour créer un récit, avec une idée dominante par séquence.
- **Do** garantir WCAG 2.2 AA, une navigation clavier complète et un contenu lisible avant, pendant et après les animations.
- **Do** conserver les cartes à `16px` maximum et les médias dominants à `24px` maximum.

### Don't:

- **Don't** produire une landing SaaS générique remplie de cartes identiques.
- **Don't** installer un univers vétérinaire froid ou clinique.
- **Don't** utiliser une esthétique enfantine de marque pour animaux ou des composants qui ressemblent à des jouets.
- **Don't** surjouer l'intelligence artificielle dans les visuels ou le discours.
- **Don't** copier littéralement Clay, ses illustrations, ses compositions ou ses mécaniques de marque.
- **Don't** utiliser de texte en dégradé, de grille décorative, de glassmorphism par défaut, de rayures ou de bordure latérale colorée supérieure à un pixel.
- **Don't** répéter une petite accroche en capitales au-dessus de chaque titre de section.
- **Don't** utiliser de sérif italique comme raccourci éditorial pour paraître premium.
- **Don't** dépasser `-0.04em` d'interlettrage négatif sur les grands titres.
