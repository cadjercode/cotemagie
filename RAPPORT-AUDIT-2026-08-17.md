# Audit de Côté Magie — 17 août 2026

## Périmètre et verdict

Audit de la version du dépôt `hostinger-build` au commit `2ed4d41`, également vérifiée sur `https://www.cotemagie.fr/` le 17 août 2026.

Le site est techniquement rapide, bien indexable et globalement propre. Les scores Lighthouse synthétiques sont excellents. La priorité réelle est une mise en conformité RGPD du formulaire et de la carte Google. Un chevauchement du header reste aussi à corriger à 320 px sur les pages de prestation.

**Verdict : très bon socle technique; corriger en priorité la transparence RGPD, puis le header à 320 px.**

> **Rectificatif du 17 août 2026.** La première version de ce rapport signalait à tort un hero tronqué sur mobile. Cette conclusion provenait de captures Chrome lancées sans synchronisation correcte sous Windows. Une contre-mesure avec Puppeteer, viewport CSS explicite et lecture du DOM confirme l'absence de débordement du hero à 320, 360, 390, 768 et 1024 px sur l'accueil et `/close-up` : `scrollWidth === clientWidth` et les rectangles du contenu restent dans le viewport. La recommandation associée a été retirée.

## Résultats mesurés

| Mesure Lighthouse | Mobile | Desktop |
|---|---:|---:|
| Performance | 100 | 100 |
| Accessibilité | 100 | 100 |
| Bonnes pratiques | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 1,4 s | 0,4 s |
| LCP | 1,5 s | 0,4 s |
| TBT | 0 ms | 0 ms |
| CLS | 0 | 0 |
| Speed Index | 2,7 s | 0,5 s |

Ces résultats sont des mesures de laboratoire ponctuelles. Ils ne remplacent pas les données réelles CrUX/Search Console.

## Points forts confirmés

- Toutes les pages publiques testées répondent en `200`; la page 404 renvoie bien un statut `404`.
- HTTPS, HSTS, `nosniff`, protection contre l'affichage en iframe, politique de référent et politique de permissions sont actifs.
- Les polices sont auto-hébergées, préchargées et utilisent `font-display: swap`.
- Les images sont légères, majoritairement en WebP, avec dimensions, textes alternatifs et lazy loading approprié.
- Chaque page indexable possède un H1 unique, une canonical et des métadonnées distinctes.
- Les JSON-LD sont syntaxiquement valides : `LocalBusiness`, `Person`, `WebSite`, `Service`, `BreadcrumbList` et FAQ selon les pages.
- Le maillage interne, le sitemap, le fichier robots, les favicons, le manifest et la page 404 sont présents.
- Les anciennes URL Wix principales sont redirigées.
- Le formulaire valide les champs côté serveur, utilise une adresse `From` du domaine et comporte un honeypot.
- La navigation clavier, les focus visibles et la préférence `prefers-reduced-motion` sont largement prises en compte.

## Problèmes prioritaires

### P1 — Information RGPD incomplète et contenu tiers incohérent

**Constat.** La politique indique qu'aucune donnée n'est transmise à un service externe (`mentions-legales.html:85`), alors que la carte Google est chargée dès l'affichage (`index.html:545`). Elle mentionne aussi Google Fonts comme ressource externe (`mentions-legales.html:89`), bien que les polices soient désormais auto-hébergées.

La durée de conservation du formulaire est seulement décrite comme « le temps nécessaire », sans durée ou critère précis. La base légale, le droit à la limitation et, selon la base retenue, le droit d'opposition ne sont pas clairement indiqués. Aucune information RGPD courte n'est affichée au niveau du formulaire lui-même.

**Impact.** Transparence insuffisante et risque de non-conformité. La CNIL demande notamment d'indiquer la finalité, la base légale, les destinataires, une durée ou ses critères et les droits applicables. Pour un contenu tiers susceptible d'utiliser des traceurs, elle recommande un consentement préalable, éventuellement contextuel.

**Correction recommandée.** Mettre à jour la politique, ajouter une mention courte sous le formulaire avec lien vers la politique, définir la base légale et une durée adaptée. Remplacer la carte par une image/lien statique ou la charger seulement après action et consentement si son fonctionnement dépose ou lit des traceurs. Faire valider le texte final par un professionnel du droit.

Références :

- CNIL — [Exemples de formulaire de collecte](https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel)
- CNIL — [Informer les personnes](https://www.cnil.fr/fr/informer-les-personnes)
- CNIL — [Contenus externes et consentement aux traceurs](https://www.cnil.fr/fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs)

### P2 — Chevauchement du header à 320 px sur les pages de prestation

**Constat.** À 320 px, le logo « Côté Magie » et le bouton « ← Accueil » se chevauchent dans le header des pages de prestation. La boîte du lien logo est comprimée à environ 140 px, mais son texte en `white-space:nowrap` continue visuellement jusqu'au bouton. Le menu burger occupe également la même ligne. Le défaut n'est plus présent à partir de 360 px.

**Impact.** Lisibilité et finition visuelle dégradées sur les téléphones les plus étroits.

**Correction recommandée.** Ajouter une règle ciblée sous 340 px : masquer le bouton « Accueil » ou abréger/masquer le texte du logo, tout en conservant le burger comme voie de navigation. Valider le résultat à 320 et 360 px.

### P2 — Modale perfectible au clavier et en accessibilité

**Constat.** La modale fermée contient encore des éléments focusables sous `aria-hidden="true"` (`index.html:566-575`). Le titre est vide dans le HTML initial (`index.html:570`). À l'ouverture, le focus est placé sur la fermeture et restitué à la fin, mais il n'est pas piégé dans la modale; `Tab` peut donc atteindre la page située derrière.

**Impact.** Parcours confus pour les utilisateurs de clavier ou de lecteur d'écran, malgré le score Lighthouse de 100.

**Correction recommandée.** Utiliser l'élément natif `<dialog>` ou gérer `inert`, le focus trap et l'état masqué. Préremplir un titre non vide ou ne créer le contenu qu'à l'ouverture.

### P2 — Protection antispam limitée

**Constat.** `send-mail.php` possède un honeypot, mais aucune limitation de fréquence, taille maximale des champs ou temporisation. Un robot qui connaît l'endpoint peut contourner le honeypot et provoquer des envois répétés.

**Impact.** Spam, consommation de quota mail et possible dégradation de la délivrabilité.

**Correction recommandée.** Ajouter des longueurs maximales côté HTML et PHP, une limite de fréquence côté serveur/IP et une temporisation. Ajouter un challenge respectueux de la vie privée seulement si le spam réel le justifie.

## Améliorations secondaires

### P3 — Validation HTML

`html-validate` signale 187 occurrences, dont la majorité est cosmétique (espaces insécables dans les numéros et styles inline). Les éléments réellement utiles à corriger sont :

- `&` non échappé dans les `<title>` et métadonnées de la page légale (`mentions-legales.html:6` et `:12`);
- boutons de navigation et de carrousel sans `type="button"`;
- cinq cartes interactives simulant des boutons avec `role="button"` au lieu d'éléments natifs;
- éléments focusables dans une zone `aria-hidden` et titre vide de la modale.

### P3 — Dates du sitemap

Toutes les valeurs `lastmod` sont fixées au 25 juillet 2026 alors que le contenu et la configuration ont été modifiés en août. Les dates devraient refléter la dernière modification substantielle de chaque page, ou être omises si elles ne peuvent pas être maintenues correctement.

### P3 — Redirection HTTP en deux sauts

`http://cotemagie.fr/` redirige d'abord vers `https://cotemagie.fr/`, puis vers `https://www.cotemagie.fr/`. La règle `.htaccess` prévoit un saut unique, mais une redirection Hostinger intervient visiblement avant Apache. Harmoniser la redirection au niveau de l'hébergeur permettrait un seul `301`.

### P3 — Type MIME du manifest

Le serveur renvoie `site.webmanifest` en `text/plain`. Il est préférable de le servir en `application/manifest+json` via la configuration serveur.

### P3 — Descriptions légèrement longues

Les descriptions de l'accueil (164 caractères) et de la page Ateliers (163) peuvent être tronquées dans certains résultats. Ce n'est pas une erreur de classement, mais une reformulation autour de 150–160 caractères améliorerait le contrôle de l'extrait.

## Ordre de correction proposé

1. Mettre à jour la politique RGPD et le chargement Google Maps.
2. Corriger le chevauchement du header à 320 px.
3. Sécuriser davantage le formulaire contre le spam.
4. Corriger la modale et les erreurs HTML pertinentes.
5. Mettre à jour le sitemap, le MIME du manifest et la chaîne de redirection HTTP.

## Contrôles effectués

- Inspection du dépôt et de l'historique Git.
- Vérification en ligne de 8 pages indexables, robots, sitemap, manifest et 404.
- Vérification des redirections HTTPS, `www`, `.html` et anciennes URL Wix.
- Lighthouse 13.4.1 mobile et desktop sur la page d'accueil en production.
- Captures visuelles desktop et mobile de l'accueil et d'une page de prestation.
- Contre-vérification responsive avec Puppeteer : viewports CSS 320, 360, 390, 768 et 1024 px, mesures `scrollWidth`/`clientWidth` et rectangles DOM.
- Analyse statique des titres, descriptions, H1, canonicals, images, identifiants, liens locaux et JSON-LD.
- Validation HTML avec `html-validate`.
- Revue manuelle du formulaire PHP, du JavaScript, de `.htaccess`, des en-têtes HTTP et des mentions légales.

## Limites de l'audit

- Aucun message de test n'a été envoyé via le formulaire afin de ne pas solliciter le client sans autorisation explicite.
- Les données Google Search Console, Google Business Profile et CrUX terrain n'étaient pas disponibles.
- La conformité juridique est une analyse technique de premier niveau, pas un avis juridique.
