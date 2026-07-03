import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LandingFooter from "../../../components/footer";
import { Header } from "../../../components/header";
import { blogPosts, getBlogPost } from "../../../lib/blog-posts";
import { JsonLd, pageBreadcrumbJsonLd, siteName, siteUrl } from "../../../lib/seo";
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

  if (!post) {
    notFound();
  }

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
      <JsonLd data={pageBreadcrumbJsonLd({ path: post.path, name: post.title })} />
      <Header />
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
        <main>
          <article className="px-4 pb-8 pt-[7.5rem] md:px-6 md:pb-14 md:pt-[8.5rem]">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="landing-reveal text-sm font-semibold text-primary hover:text-primary/78"
              >
                Blog
              </Link>
              <div className="landing-reveal landing-reveal-2 mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {post.category}
                </span>
                <span>{post.readingTime}</span>
                <time dateTime={post.publishedAt}>
                  Mis à jour le {formatDate(post.updatedAt)}
                </time>
              </div>
              <h1 className="landing-reveal landing-reveal-3 mt-6 text-4xl font-semibold leading-none tracking-tight sm:text-5xl md:text-6xl">
                {post.title}
              </h1>
              <p className="landing-reveal landing-reveal-4 mt-6 text-lg leading-8 text-muted-foreground">
                {post.description}
              </p>

              <div className="landing-reveal landing-reveal-5 mt-8 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  À retenir
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6">
                  {post.takeaways.map((takeaway) => (
                    <li key={takeaway} className="grid grid-cols-[auto_1fr] gap-3">
                      <span className="mt-2 size-1.5 rounded-full bg-secondary" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 space-y-10">
                {post.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </article>

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background md:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Continuer
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                  Relier l&apos;article à votre pratique.
                </h2>
                <p className="mt-5 text-sm leading-6 text-background/62">
                  Chaque ressource pointe vers une page utile pour approfondir,
                  comparer ou essayer Biume en situation réelle.
                </p>
              </div>
              <div className="rounded-[2rem] border border-border bg-card p-5 md:p-7">
                <div className="flex flex-wrap gap-3">
                  {post.relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href={webAppPath("/signup")}
                  prefetch={false}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98]"
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
