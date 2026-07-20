# Biume — Vision produit

## Statut du document

Ce document décrit la proposition produit cible de Biume et les décisions qui doivent guider la stratégie, le design et l’implémentation.

Il distingue la vision validée de l’état actuel du produit. Une capacité décrite dans le parcours cible n’est pas nécessairement déjà disponible.

## Proposition produit

> Biume aide les ostéopathes animaliers indépendants à transformer une courte dictée de séance en un compte rendu complet, prêt à relire en quelques minutes. Le praticien valide chaque étape, partage le rapport et programme automatiquement le suivi du propriétaire.

Version courte :

> Dictez votre séance. Biume prépare le compte rendu et le suivi. Vous validez chaque étape.

Avant validation terrain de la performance, la communication emploie « en quelques minutes ». La promesse « en moins de cinq minutes » ne devient publique qu’après avoir satisfait le protocole de validation décrit dans ce document.

## Positionnement

Biume est l’outil spécialisé du compte rendu et du suivi post-séance pour les ostéopathes animaliers indépendants.

Biume n’est pas présenté comme :

- un logiciel de gestion généraliste ;
- un CRM complet pour toutes les professions animales ;
- un générateur de texte générique ;
- un outil de diagnostic autonome ;
- un produit dont l’intelligence artificielle constitue la promesse principale.

L’agenda, les dossiers propriétaires et animaux et les fonctions de gestion servent le parcours du compte rendu. Ils ne constituent pas la catégorie principale du produit.

## Client prioritaire

Le premier client idéal est un ostéopathe animalier indépendant qui :

- travaille souvent seul et en mobilité ;
- réalise plusieurs séances par semaine ;
- prend ses notes dans un carnet, un document, son téléphone ou sa messagerie ;
- transforme ensuite manuellement ses observations en compte rendu propriétaire ;
- décide seul de l’achat de ses outils professionnels.

Le marketing nomme explicitement les ostéopathes animaliers. D’autres praticiens peuvent utiliser Biume, mais ils ne doivent pas diluer le message initial.

## Problème principal

La douleur d’entrée est le temps passé après les séances à transformer des notes métier en comptes rendus compréhensibles.

> « Je perds mes soirées à transformer mes notes de séance en comptes rendus compréhensibles. »

Les bénéfices complémentaires sont :

- une meilleure compréhension de la séance par le propriétaire ;
- un suivi post-séance régulier ;
- une continuité claire entre la séance, le retour du propriétaire et la prochaine action ;
- une présentation professionnelle qui conserve la précision métier du praticien.

## Résultat cible

À partir de notes brutes et potentiellement incomplètes, le praticien doit pouvoir obtenir un compte rendu structuré prêt à relire en moins de cinq minutes après la séance.

Les cinq minutes couvrent tout le parcours actif : capture, transcription, structuration, vérification et obtention du brouillon prêt à relire. Elles ne couvrent pas les interruptions externes du praticien.

Un rapport est considéré comme complet lorsque chaque étape a été traitée. Une étape peut être :

- renseignée ;
- préremplie puis validée ;
- corrigée par le praticien ;
- explicitement marquée « non applicable ».

La règle produit est : zéro étape oubliée, zéro saisie superflue.

## Parcours signature

1. Le praticien ouvre un rendez-vous du jour ou lance une capture libre.
2. Il dicte ou écrit un résumé court de la séance.
3. En l’absence de réseau, l’enregistrement est conservé localement et placé en attente de synchronisation.
4. Biume produit une transcription fidèle que le praticien peut corriger.
5. Biume extrait les informations vers les étapes du rapport sans inventer les données manquantes.
6. Chaque proposition reste traçable jusqu’au passage correspondant de la transcription.
7. Les informations absentes ou incertaines sont signalées au praticien.
8. Le praticien confirme, corrige ou marque les sections non applicables.
9. Il finalise et partage un rapport simple depuis le mobile, ou poursuit un cas complexe sur le web.
10. Il valide un message et une échéance de suivi propriétaire.
11. Biume envoie automatiquement le suivi à la date programmée.
12. Biume centralise la réponse et signale uniquement les situations qui demandent une action.

## Répartition mobile, web et propriétaire

### Application mobile native

L’application mobile est le compagnon de terrain. Sa première version couvre :

- les rendez-vous du jour et à venir ;
- la création, le déplacement et la clôture d’une séance ;
- la création rapide d’un propriétaire et d’un animal ;
- l’historique récent de l’animal ;
- la dictée avec capture hors ligne ;
- la correction de la transcription ;
- le préremplissage du rapport ;
- la validation et le partage des rapports simples ;
- le traitement des rapports en attente et des suivis qui demandent une action.

La facturation, les imports, l’administration, les réglages avancés et la gestion détaillée des dossiers restent hors du MVP mobile.

### Application web

Le web conserve le module de rapport avancé et les opérations exigeant davantage d’espace ou de précision :

- l’anatomie détaillée ;
- les corrections complexes ;
- la personnalisation et la prévisualisation du document ;
- l’historique complet ;
- l’administration et les fonctions de gestion avancées.

Le mobile et le web manipulent le même rapport et le même modèle de données. Il n’existe pas de format « rapport mobile » distinct.

### Expérience propriétaire

Le propriétaire n’installe pas d’application et ne crée pas de compte.

- Il ouvre un lien sécurisé depuis son téléphone.
- Il valide son identité avec un OTP lors du premier accès sur un nouvel appareil.
- Une session sécurisée peut rester valide pendant 30 jours.
- Il consulte le compte rendu et répond au questionnaire de suivi dans une interface web mobile.

## Suivi post-séance

Le suivi ne se limite pas à demander une nouvelle prise de rendez-vous.

Lors de la finalisation du rapport, le praticien choisit l’échéance et valide un questionnaire court, standardisé mais modifiable. Le modèle initial demande :

1. comment l’état de l’animal a évolué depuis la séance ;
2. si une réaction ou un changement particulier a été observé ;
3. si le propriétaire souhaite être recontacté.

Le questionnaire combine une échelle simple, un commentaire libre et une demande explicite de contact.

Biume envoie le message automatiquement à la date validée. Les alertes sont d’abord fondées sur des règles explicites : dégradation déclarée, réaction importante ou demande de contact. Une analyse du texte libre peut suggérer un signal supplémentaire, mais elle doit en expliquer la raison et ne produit jamais de diagnostic.

## Contrôle, confiance et sécurité

Biume prépare ; le praticien décide.

- L’intelligence artificielle ne partage rien sans validation préalable du praticien.
- Elle ne transforme pas une hypothèse ou une observation en diagnostic certain.
- Elle n’invente pas les informations absentes.
- Une entrée insuffisante produit un brouillon partiel guidé, pas un blocage ni un remplissage spéculatif.
- La transcription est visible avant l’interprétation structurée.
- Les propositions conservent une trace vers leur source.
- Les incertitudes et les échecs de synchronisation sont visibles et récupérables.

Les enregistrements audio sont supprimés dès validation de la transcription, ou au plus tard après 24 heures. La transcription corrigée et le rapport peuvent être conservés. La conservation de l’audio au-delà de cette période exige un choix explicite du praticien.

## Notifications mobiles

Les notifications sont limitées aux événements qui demandent une action :

- une dictée n’a pas pu être synchronisée ;
- un brouillon attend encore sa validation ;
- un propriétaire souhaite être recontacté ;
- une réponse satisfait une règle de signalement explicite.

Les générations réussies, ouvertures de messages et autres événements passifs ne déclenchent pas de notification par défaut.

## Activation et modèle économique

Biume est facturé par praticien, pas par rapport ni par message.

- Mensuel : 29,99 € par mois.
- Annuel : 24,99 € par mois, facturé annuellement.
- Essai : 15 jours sans carte bancaire.
- Comptes rendus et suivis inclus, sous réserve de limites raisonnables contre les abus techniques.

Un utilisateur est considéré comme activé lorsqu’il a créé au moins trois vrais comptes rendus et programmé au moins un suivi propriétaire pendant son essai.

## Métriques principales

### Adoption du parcours

Nombre de parcours de séance complétés par praticien et par mois.

Un parcours est complété lorsqu’un compte rendu a été validé et partagé, puis qu’un suivi a été programmé.

### Gain de temps

Temps médian actif entre la fin de la séance et le brouillon prêt à relire, avec un objectif inférieur à cinq minutes.

### Qualité du suivi

- pourcentage de questionnaires auxquels les propriétaires répondent ;
- pourcentage de réponses demandant une attention effectivement traitées par le praticien.

## Validation terrain

La promesse chiffrée est testée avec cinq ostéopathes animaliers indépendants réalisant au moins six parcours réels chacun, soit un minimum de 30 comptes rendus.

La promesse est considérée comme validée si :

- le temps médian actif est inférieur à cinq minutes ;
- au moins 80 % des rapports sont jugés exacts et complets avec seulement des corrections mineures ;
- aucun rapport ne contient d’information clinique inventée.

Avant cette validation, les supports publics utilisent « en quelques minutes » et ne présentent pas les cinq minutes comme un fait établi.

## Périmètre du MVP

Le MVP constitue une boucle verticale complète :

- création rapide du propriétaire et de l’animal ;
- rendez-vous ou capture libre ;
- dictée en ligne ou hors ligne ;
- transcription vérifiable ;
- extraction vers le rapport partagé ;
- validation mobile des cas simples ;
- édition web avancée ;
- accès propriétaire par OTP ;
- partage du compte rendu ;
- programmation et envoi du questionnaire ;
- collecte des réponses et alertes actionnables ;
- instrumentation des métriques de temps, qualité et activation.

Aucune fonctionnalité mobile supplémentaire ne doit être ajoutée avant que cinq praticiens aient terminé au moins trois parcours réels chacun.

## Ordre de lancement

1. Unifier le modèle de rapport et simplifier la création propriétaire/animal.
2. Construire le parcours mobile : rendez-vous, dictée, transcription, préremplissage et validation.
3. Ajouter l’accès propriétaire par OTP et le partage du rapport.
4. Fermer la boucle avec le questionnaire programmé, les réponses et les alertes.
5. Lancer un pilote privé avec cinq ostéopathes.
6. Mesurer 30 rapports et vérifier les seuils de temps et de qualité.
7. Ouvrir publiquement seulement après validation de la proposition.

## État actuel et écarts connus

### Déjà présent ou largement amorcé

- dossiers propriétaires et animaux ;
- agenda et rendez-vous ;
- rapport structuré avec observations, anatomie, recommandations et notes ;
- préparation d’une version compréhensible par le propriétaire ;
- contrôle humain avant application du contenu proposé ;
- génération PDF et envoi par e-mail ;
- rappels programmés ;
- tarification unique et essai de 15 jours.

### Partiellement aligné

- le rapport web possède les bonnes sections, mais son parcours reste plus manuel que la promesse cible ;
- les rappels actuels servent surtout la reprise de rendez-vous et ne collectent pas encore l’évolution de l’animal ;
- le marketing est spécialisé sur certaines pages, tandis que des textes produit et e-mails présentent encore Biume comme une plateforme de gestion globale ;
- la création d’un rapport dépend encore d’un dossier animal préexistant ;
- des variables PostHog existent, mais les métriques produit définies ici ne sont pas encore instrumentées dans le parcours observé.

### Manquant

- application mobile native ;
- capture audio et fonctionnement hors ligne ;
- transcription et correction avant interprétation ;
- extraction structurée d’une dictée vers le rapport ;
- traçabilité entre les champs générés et la transcription ;
- accès propriétaire sans compte protégé par OTP ;
- questionnaire de suivi et modèle de réponse ;
- alertes actionnables fondées sur les réponses ;
- mesure end-to-end du temps et de la qualité du rapport.

## Principe de décision

Toute nouvelle fonctionnalité doit répondre à cette question :

> Aide-t-elle directement l’ostéopathe à produire plus vite un compte rendu fiable, à le faire comprendre au propriétaire ou à assurer le suivi après la séance ?

Si la réponse est non, elle ne relève pas du cœur produit et ne doit pas retarder la boucle principale.
