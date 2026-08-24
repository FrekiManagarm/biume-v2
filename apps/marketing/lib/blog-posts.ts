import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blog } from "./blog/source";
import { absoluteUrl } from "./seo";

type BlogSection = {
  heading: string;
  body: readonly string[];
};

export type BlogPost = {
  slug: string;
  path: string;
  href: string;
  title: string;
  description: string;
  keyword: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  summary: string;
  takeaways: readonly string[];
  sections: readonly BlogSection[];
  relatedLinks: readonly {
    href: string;
    label: string;
  }[];
};

type MdxFrontmatter = {
  title?: string;
  description?: string;
  date?: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
  category?: string;
  keyword?: string;
  readingTime?: string;
  summary?: string;
  takeaways?: string[];
  relatedLinks?: {
    href: string;
    label: string;
  }[];
};

export function getFumadocsBlogPages(): BlogPost[] {
  return blog
    .getPages()
    .map((page) => {
      const slug = page.slugs[0] ?? "";
      const frontmatter = readBlogFrontmatter(slug);
      const tags = frontmatter.tags ?? [];
      const firstTag = tags[0] ?? "Blog";
      const path = `/blog/${slug}`;

      return {
        slug,
        path,
        href: absoluteUrl(path),
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
        keyword: frontmatter.keyword ?? firstTag,
        category: frontmatter.category ?? firstTag,
        readingTime: frontmatter.readingTime ?? "5 min",
        publishedAt: frontmatter.date ?? "2026-01-01",
        updatedAt: frontmatter.updatedAt ?? frontmatter.date ?? "2026-01-01",
        summary: frontmatter.summary ?? frontmatter.description ?? "",
        takeaways: frontmatter.takeaways ?? [],
        sections: [],
        relatedLinks: normalizeRelatedLinks(frontmatter.relatedLinks ?? []),
      };
    })
    .sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

export const blogPosts: readonly BlogPost[] = getFumadocsBlogPages();

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

/**
 * Rotation cyclique : l'article i pointe vers i+1 et i+2. Chaque article recoit
 * donc exactement deux liens entrants de ses pairs, sans qu'aucun ne depende
 * d'un choix editorial a maintenir. Avant, les articles n'avaient qu'un seul
 * lien entrant (l'index du blog) pendant que /cgu et /privacy en cumulaient 30
 * via le pied de page sitewide.
 */
export function getRelatedBlogPosts(slug: string, count = 2): BlogPost[] {
  const index = blogPosts.findIndex((post) => post.slug === slug);

  if (index === -1 || blogPosts.length <= 1) {
    return [];
  }

  const reachable = Math.min(count, blogPosts.length - 1);

  return Array.from(
    { length: reachable },
    (_, offset) => blogPosts[(index + offset + 1) % blogPosts.length]!,
  );
}

export function getBlogPage(slug: string) {
  return blog.getPage([slug]);
}

export function getBlogPostContent(slug: string) {
  const source = readBlogSource(slug);

  return matter(source).content.trim();
}

function normalizeRelatedLinks(links: readonly { href: string; label: string }[]) {
  if (links.length > 0) {
    return links;
  }

  return [
    { href: "/logiciel-osteopathe-animalier", label: "Logiciel Biume" },
    { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu propriétaire" },
    { href: "/tarifs", label: "Essayer Biume" },
  ];
}

function readBlogFrontmatter(slug: string): MdxFrontmatter {
  return matter(readBlogSource(slug)).data as MdxFrontmatter;
}

function readBlogSource(slug: string) {
  const cwd = process.cwd();
  const marketingRoot = cwd.endsWith(`${path.sep}apps${path.sep}marketing`)
    ? cwd
    : path.join(cwd, "apps/marketing");
  const filePath = path.join(marketingRoot, "content/blog", `${slug}.mdx`);

  return readFileSync(filePath, {
    encoding: "utf8",
  });
}
