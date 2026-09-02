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

// Un lastmod identique et code en dur sur toutes les URLs est un signal que
// Google apprend a ignorer. Les articles ont une vraie date de mise a jour dans
// leur frontmatter ; les pages statiques n'en ont aucune de fiable, donc elles
// n'en declarent pas — lastmod est optionnel, mentir ne l'est pas.
const blogLastModifiedByPath = new Map(
  blogPosts.map((post) => [post.path, new Date(post.updatedAt)]),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const lastModified = blogLastModifiedByPath.get(route);

    return {
      url: absoluteUrl(route),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: route === "/" || route === "/blog" ? "weekly" : "monthly",
      priority:
        route === "/"
          ? 1
          : route === "/blog"
            ? 0.8
            : route.includes("osteopathe")
              ? 0.9
              : 0.7,
    };
  });
}
