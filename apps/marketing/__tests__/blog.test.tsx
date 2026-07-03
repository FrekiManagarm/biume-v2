import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import BlogIndexPage, { metadata as blogMetadata } from "../app/blog/page";
import BlogPostPage, {
  generateMetadata,
  generateStaticParams,
} from "../app/blog/[slug]/page";
import sitemap from "../app/sitemap";
import { blogPosts } from "../lib/blog-posts";

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
