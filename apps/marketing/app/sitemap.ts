import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/seo";

const routes = [
  "/",
  "/logiciel-osteopathe-animalier",
  "/compte-rendu-osteopathe-animalier",
  "/tarifs",
  "/comparatifs",
  "/modele-compte-rendu-osteopathe-animalier",
  "/exemple-compte-rendu-osteopathie-animale",
  "/suivi-post-seance-animal",
  "/relance-client-osteopathe-animalier",
  "/alternatives/animalib",
  "/alternatives/stenko",
  "/alternatives/hunimalis",
  "/alternatives/mytour",
  "/comparatifs/neovoice-vs-biume",
  "/alternatives/mypawscribe",
  "/about",
  "/privacy",
  "/cgu",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-06-30"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.includes("osteopathe") ? 0.9 : 0.7,
  }));
}
