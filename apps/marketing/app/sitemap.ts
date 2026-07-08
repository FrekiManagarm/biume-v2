import type { MetadataRoute } from "next";
import { blogPosts } from "../lib/blog-posts";
import { absoluteUrl } from "../lib/seo";

const staticRoutes = [
  "/",
  "/osteopathe-animalier",
  "/logiciel-osteopathe-animalier",
  "/compte-rendu-osteopathe-animalier",
  "/tarifs",
  "/comparatifs",
  "/blog",
  "/modele-compte-rendu-osteopathe-animalier",
  "/exemple-compte-rendu-osteopathie-animale",
  "/suivi-post-seance-animal",
  "/relance-client-osteopathe-animalier",
  "/alternatives/animalib",
  "/alternatives/stenko",
  "/alternatives/hunimalis",
  "/alternatives/kiwiappli",
  "/alternatives/mytour",
  "/comparatifs/neovoice-vs-biume",
  "/alternatives/neovoice",
  "/alternatives/mypawscribe",
  "/about",
  "/privacy",
  "/cgu",
] as const;

const routes = [...staticRoutes, ...blogPosts.map((post) => post.path)] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(route.startsWith("/blog") ? "2026-07-03" : "2026-06-30"),
    changeFrequency: route === "/" || route === "/blog" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/blog"
          ? 0.8
          : route.includes("osteopathe")
            ? 0.9
            : 0.7,
  }));
}
