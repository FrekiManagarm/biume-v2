import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import BlogIndexPage, { metadata as blogMetadata } from "../app/blog/page";
import BlogPostPage, {
  generateMetadata,
  generateStaticParams,
} from "../app/blog/[slug]/page";
import sitemap from "../app/sitemap";
import { blogPosts, getFumadocsBlogPages } from "../lib/blog-posts";

describe("marketing blog", () => {
  test("blog index exposes SEO metadata, article cards, and schema", () => {
    const html = renderToStaticMarkup(<BlogIndexPage />);

    expect(blogMetadata.title).toBe("Blog ostéopathe animalier");
    expect(String(blogMetadata.description).length).toBeGreaterThan(120);
    expect(String(blogMetadata.description).length).toBeLessThanOrEqual(170);
    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Accueil"');
    expect(html).toContain('"item":"https://biume.com/blog"');
    expect(html).toContain("Blog ostéopathe animalier");

    for (const post of blogPosts) {
      expect(html).toContain(post.title);
      expect(html).toContain(post.href);
    }
  });

  test("blog article pages expose static params, metadata, schema, and internal links", async () => {
    const params = generateStaticParams();
    const firstPost = blogPosts[0];

    expect(params).toEqual(blogPosts.map((post) => ({ slug: post.slug })));

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: firstPost.slug }),
    });
    expect(metadata.title).toBe(firstPost.title);
    expect(metadata.description).toBe(firstPost.description);
    expect(metadata.alternates?.canonical).toBe(firstPost.href);

    const element = await BlogPostPage({
      params: Promise.resolve({ slug: firstPost.slug }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Blog"');
    expect(html).toContain(`"item":"${firstPost.href}"`);
    expect(html).toContain(firstPost.title);
    expect(html.toLowerCase()).toContain(firstPost.keyword.toLowerCase());
    expect(html).toContain("Essayer 15 jours gratuitement");
    expect(html).toContain("/compte-rendu-osteopathe-animalier");
  });

  test("sitemap includes the blog index and every blog article", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://biume.com/blog");
    for (const post of blogPosts) {
      expect(urls).toContain(post.href);
    }
  });

  test("blog posts are loaded from the Fumadocs MDX source", () => {
    const pages = getFumadocsBlogPages();
    const slugs = pages.map((page) => page.slug);

    expect(slugs).toContain("digitalisation-comptes-rendus");
    expect(slugs).toContain("qu-est-ce-que-biume");
    expect(slugs).toContain("migrer-depuis-neovoice-pro");
    expect(blogPosts.map((post) => post.slug)).toEqual(slugs);
  });

  test("model report article targets the compte rendu template cluster", async () => {
    const post = blogPosts.find(
      (item) => item.slug === "modele-compte-rendu-osteopathe-animalier",
    );

    expect(post).toBeDefined();
    expect(post?.keyword).toBe("modèle compte rendu ostéopathe animalier");
    expect(post?.relatedLinks.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        "/modele-compte-rendu-osteopathe-animalier",
        "/compte-rendu-osteopathe-animalier",
        "/tarifs",
      ]),
    );

    const element = await BlogPostPage({
      params: Promise.resolve({ slug: "modele-compte-rendu-osteopathe-animalier" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html.toLowerCase()).toContain("modèle compte rendu ostéopathe animalier");
    expect(html).toContain("Synthèse propriétaire");
    expect(html).toContain("/modele-compte-rendu-osteopathe-animalier");
  });

  test("NeoVoice migration article captures the transition intent without private shutdown claims", async () => {
    const post = blogPosts.find((item) => item.slug === "migrer-depuis-neovoice-pro");

    expect(post).toBeDefined();
    expect(post?.keyword).toBe("migrer depuis NeoVoice Pro");
    expect(post?.relatedLinks.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        "/alternatives/neovoice",
        "/comparatifs/neovoice-vs-biume",
        "/tarifs",
      ]),
    );

    const element = await BlogPostPage({
      params: Promise.resolve({ slug: "migrer-depuis-neovoice-pro" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Changer d");
    expect(html).toContain("suivi client");
    expect(html).not.toContain("exportez vos données");
    expect(html).not.toContain("31 août 2026");
    expect(html).toContain("Essayer 15 jours gratuitement");
  });
});

describe("blog SERP hygiene", () => {
  // Audit SEO 24/08/2026 : deux slugs avaient perdu leurs accents en cours de
  // route (« grce », « sant », « lia ») et deux titres depassaient 100
  // caracteres, donc tronques dans les resultats de recherche.
  const TITLE_SUFFIX = " | Biume".length;

  test("no slug carries an accent-stripped word fragment", () => {
    const broken = ["-grce-", "-sant-", "-lia-", "-aprs-", "-priv-"];

    for (const post of blogPosts) {
      for (const fragment of broken) {
        expect(`-${post.slug}-`).not.toContain(fragment);
      }
    }
  });

  test("slugs stay url-safe and reasonably short", () => {
    for (const post of blogPosts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.slug.length).toBeLessThanOrEqual(60);
    }
  });

  // 80 et non 60 : les titres du cluster placent deja leur mot-cle en tete, une
  // troncature SERP ne coupe donc que la queue explicative. Ce plafond vise les
  // titres reellement hors-normes (les deux fautifs faisaient 107 et 108).
  test("no title runs so long that the SERP cuts into its substance", () => {
    for (const post of blogPosts) {
      expect({
        slug: post.slug,
        overLimit: post.title.length + TITLE_SUFFIX > 80,
      }).toEqual({ slug: post.slug, overLimit: false });
    }
  });

  test("descriptions fit the SERP snippet", () => {
    for (const post of blogPosts) {
      expect(post.description.length).toBeGreaterThan(70);
      expect(post.description.length).toBeLessThanOrEqual(160);
    }
  });

  test("each article renders exactly one H1", async () => {
    for (const post of blogPosts) {
      const element = await BlogPostPage({
        params: Promise.resolve({ slug: post.slug }),
      });
      const html = renderToStaticMarkup(element);
      const h1Count = html.match(/<h1\b/g)?.length ?? 0;

      expect({ slug: post.slug, h1Count }).toEqual({
        slug: post.slug,
        h1Count: 1,
      });
    }
  });
});

describe("blog internal linking", () => {
  // Audit SEO 24/08/2026 : chaque article n'avait qu'un seul lien entrant
  // (l'index), tandis que /cgu et /privacy en recoltaient 30 via le pied de
  // page. La rotation cyclique garantit a chaque article deux liens de pairs.
  test("every article links to two siblings, and none links to itself", async () => {
    const { getRelatedBlogPosts } = await import("../lib/blog-posts");

    for (const post of blogPosts) {
      const siblings = getRelatedBlogPosts(post.slug);

      expect(siblings).toHaveLength(2);
      expect(siblings.map((item) => item.slug)).not.toContain(post.slug);
      expect(new Set(siblings.map((item) => item.slug)).size).toBe(2);
    }
  });

  test("every article receives at least two inbound links from its peers", async () => {
    const { getRelatedBlogPosts } = await import("../lib/blog-posts");
    const inbound = new Map(blogPosts.map((post) => [post.slug, 0]));

    for (const post of blogPosts) {
      for (const sibling of getRelatedBlogPosts(post.slug)) {
        inbound.set(sibling.slug, (inbound.get(sibling.slug) ?? 0) + 1);
      }
    }

    for (const [slug, count] of inbound) {
      expect({ slug, count }).toEqual({ slug, count: 2 });
    }
  });

  test("the rendered article exposes its sibling links", async () => {
    const { getRelatedBlogPosts } = await import("../lib/blog-posts");
    const post = blogPosts[0]!;
    const element = await BlogPostPage({
      params: Promise.resolve({ slug: post.slug }),
    });
    const html = renderToStaticMarkup(element);

    for (const sibling of getRelatedBlogPosts(post.slug)) {
      expect(html).toContain(`href="${sibling.path}"`);
      expect(html).toContain(sibling.title);
    }
  });
});
