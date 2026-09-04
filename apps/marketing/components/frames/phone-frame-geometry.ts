/**
 * Géométrie du cadre de téléphone, dans son propre module.
 *
 * `phone-frame.tsx` est un module `"use client"` : une constante exportée de
 * là arrive dans un composant serveur sous forme de référence client, pas de
 * valeur — `PHONE_CONTENT_WIDTH` y valait `undefined`, et l'échelle des
 * maquettes tombait à `scale(NaN)`. Les cotes vivent donc ici, dans un module
 * neutre que les deux côtés peuvent lire.
 */

export const PHONE_FRAME = { width: 433, height: 882 };

/** Largeur du repère dans lequel le contenu du cadre est dessiné. */
export const PHONE_CONTENT_WIDTH = 216;

export const PHONE_SCREEN = {
  left: 4.908,
  top: 2.183,
  width: 89.954,
  height: 95.635,
  radiusX: 14.32,
  radiusY: 6.61,
};

/**
 * Hauteur du contenu dans son propre repère, déduite du rapport de l'écran.
 *
 * Sans elle, le conteneur mis à l'échelle n'a qu'une largeur : sa hauteur
 * suit le contenu, et un enfant en `h-full` ne remplit plus rien. Les
 * maquettes se tassaient alors en haut de l'écran, sous l'encoche.
 */
export const PHONE_CONTENT_HEIGHT = Math.round(
  (PHONE_CONTENT_WIDTH * (PHONE_FRAME.height * PHONE_SCREEN.height)) /
    (PHONE_FRAME.width * PHONE_SCREEN.width),
);
