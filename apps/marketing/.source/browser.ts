// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blogPosts: create.doc("blogPosts", {"compte-rendu-osteopathe-animalier-proprietaire.mdx": () => import("../content/blog/compte-rendu-osteopathe-animalier-proprietaire.mdx?collection=blogPosts"), "digitalisation-comptes-rendus.mdx": () => import("../content/blog/digitalisation-comptes-rendus.mdx?collection=blogPosts"), "gagner-1h-par-jour-grce-un-module-de-rapport-le-secret-des-pros-de-la-sant-animale-intelligent.mdx": () => import("../content/blog/gagner-1h-par-jour-grce-un-module-de-rapport-le-secret-des-pros-de-la-sant-animale-intelligent.mdx?collection=blogPosts"), "logiciel-osteopathe-animalier-choisir.mdx": () => import("../content/blog/logiciel-osteopathe-animalier-choisir.mdx?collection=blogPosts"), "migrer-depuis-neovoice-pro.mdx": () => import("../content/blog/migrer-depuis-neovoice-pro.mdx?collection=blogPosts"), "modele-compte-rendu-osteopathe-animalier.mdx": () => import("../content/blog/modele-compte-rendu-osteopathe-animalier.mdx?collection=blogPosts"), "pourquoi-les-professionnels-de-la-sant-animale-doivent-adopter-lia-maintenant-et-pas-dans-5-ans.mdx": () => import("../content/blog/pourquoi-les-professionnels-de-la-sant-animale-doivent-adopter-lia-maintenant-et-pas-dans-5-ans.mdx?collection=blogPosts"), "qu-est-ce-que-biume.mdx": () => import("../content/blog/qu-est-ce-que-biume.mdx?collection=blogPosts"), "suivi-post-seance-animal-relance.mdx": () => import("../content/blog/suivi-post-seance-animal-relance.mdx?collection=blogPosts"), }),
};
export default browserCollections;