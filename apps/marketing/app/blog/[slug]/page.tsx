import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import defaultMdxComponents from "fumadocs-ui/mdx";
import LandingFooter from "../../../components/footer";
import { Header } from "../../../components/header";
import {
  blogPosts,
  getBlogPage,
  getBlogPost,
  getBlogPostContent,
} from "../../../lib/blog-posts";
import {
  JsonLd,
  pageBreadcrumbJsonLd,
  siteName,
  siteUrl,
} from "../../../lib/seo";
import { webAppPath } from "../../../lib/web-app-url";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: post.href,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.href,
      siteName,
      locale: "fr_FR",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const page = getBlogPage(slug);

  if (!post || !page) {
    notFound();
  }

  const Mdx = page.data.body;
  const mdxFallback =
    typeof Mdx === "function" ? null : getBlogPostContent(slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: post.href,
    author: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    about: post.keyword,
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd
        data={pageBreadcrumbJsonLd({ path: post.path, name: post.title })}
      />
      <Header />
      <div className="min-h-dvh overflow-x-hidden bg-[color:var(--v2-canvas)] text-[color:var(--v2-ink)] selection:bg-[color:var(--v2-accent)]/25">
        <main id="contenu" tabIndex={-1}>
          <article className="px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="v2-link landing-reveal text-sm font-semibold text-[color:var(--v2-violet-ink)]"
              >
                Blog
              </Link>
              <div className="landing-reveal landing-reveal-2 mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[color:var(--v2-ink-faint)]">
                <span className="rounded-full bg-[color:var(--v2-violet-soft)] px-3 py-1 text-[color:var(--v2-violet-ink)]">
                  {post.category}
                </span>
                <span>{post.readingTime}</span>
                <time dateTime={post.publishedAt}>
                  Mis à jour le {formatDate(post.updatedAt)}
                </time>
              </div>
              <h1 className="v2-display landing-reveal landing-reveal-3 mt-6 text-[clamp(2.7rem,6vw,5.4rem)] font-medium leading-[1.02] tracking-[-0.05em]">
                {post.title}
              </h1>
              <p className="landing-reveal landing-reveal-4 mt-6 text-lg leading-8 text-[color:var(--v2-ink-soft)]">
                {post.description}
              </p>

              {post.takeaways.length > 0 ? (
                <div className="landing-reveal landing-reveal-5 mt-8 border-y border-[color:var(--v2-line)] py-6">
                  <p className="v2-eyebrow">
                    À retenir
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6">
                    {post.takeaways.map((takeaway) => (
                      <li
                        key={takeaway}
                        className="grid grid-cols-[auto_1fr] gap-3"
                      >
                        <span className="mt-2 size-1.5 rounded-full bg-[color:var(--v2-green)]" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-10 space-y-7 text-base leading-8 text-[color:var(--v2-ink-soft)] [&_a]:font-semibold [&_a]:text-[color:var(--v2-violet-ink)] [&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--v2-violet-ink)] [&_blockquote]:pl-5 [&_blockquote]:text-[color:var(--v2-ink)] [&_h1]:text-3xl [&_h1]:font-medium [&_h1]:leading-tight [&_h1]:tracking-tight [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-[color:var(--v2-ink)] [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-[color:var(--v2-ink)] [&_hr]:border-[color:var(--v2-line)] [&_li]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_strong]:font-semibold [&_strong]:text-[color:var(--v2-ink)] [&_ul]:list-disc [&_ul]:pl-6">
                {typeof Mdx === "function" ? (
                  <Mdx components={defaultMdxComponents} />
                ) : (
                  <MdxTextFallback content={mdxFallback ?? ""} />
                )}
              </div>
            </div>
          </article>

          <section className="border-t border-[color:var(--v2-line)] px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-5 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[24px] bg-[color:var(--v2-espresso)] p-7 text-white md:p-9">
                <p className="v2-eyebrow text-[color:var(--v2-green)]">
                  Continuer
                </p>
                <h2 className="v2-display mt-5 text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                  Relier l&apos;article à votre pratique.
                </h2>
                <p className="mt-5 text-sm leading-6 text-white/65">
                  Chaque ressource pointe vers une page utile pour approfondir,
                  comparer ou essayer Biume en situation réelle.
                </p>
              </div>
              <div className="v2-panel p-7 md:p-8">
                <div className="flex flex-wrap gap-3">
                  {post.relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="v2-btn v2-btn-secondary px-4 py-2 text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  className="v2-btn v2-btn-primary v2-btn-lg mt-6"
                >
                  Essayer 15 jours gratuitement
                </Link>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function MdxTextFallback({ content }: { content: string }) {
  return (
    <>
      {content
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((block) => {
          if (block.startsWith("## ")) {
            return <h2 key={block}>{block.replace(/^## /, "")}</h2>;
          }

          if (block.startsWith("# ")) {
            return <h1 key={block}>{block.replace(/^# /, "")}</h1>;
          }

          return <p key={block}>{block}</p>;
        })}
    </>
  );
}
