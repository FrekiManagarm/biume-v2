import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import LandingFooter from "../../components/footer";
import { Header } from "../../components/header";
import { blogPosts } from "../../lib/blog-posts";
import {
  absoluteUrl,
  JsonLd,
  pageBreadcrumbJsonLd,
  pageMetadata,
  siteName,
  siteUrl,
} from "../../lib/seo";
import { webAppPath } from "../../lib/web-app-url";

export const metadata: Metadata = pageMetadata({
  title: "Blog ostéopathe animalier",
  description:
    "Conseils SEO et terrain pour ostéopathes animaliers: comptes rendus, suivi post-séance, relances client et choix d'un logiciel métier.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog ostéopathe animalier",
    url: absoluteUrl("/blog"),
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: post.href,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={pageBreadcrumbJsonLd({ path: "/blog", name: "Blog" })} />
      <Header />
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
        <main>
          <section className="relative overflow-hidden px-4 pb-10 pt-[7.5rem] md:px-6 md:pb-16 md:pt-[8.5rem]">
            <BlogBackdrop />
            <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
              <div>
                <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary backdrop-blur-md">
                  <span className="relative flex size-2.5 rounded-full bg-secondary">
                    <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
                  </span>
                  Ressources praticiens
                </div>
                <h1 className="landing-reveal landing-reveal-2 mt-7 max-w-3xl text-4xl font-semibold leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Blog ostéopathe animalier
                </h1>
                <p className="landing-reveal landing-reveal-3 mt-6 max-w-[64ch] text-base leading-7 text-muted-foreground md:text-lg">
                  Des guides courts pour améliorer vos comptes rendus, votre suivi
                  post-séance animal, vos relances propriétaire et votre choix de
                  logiciel ostéopathe animalier.
                </p>
                <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98]"
                  >
                    Essayer 15 jours gratuitement
                  </Link>
                  <Link
                    href="/compte-rendu-osteopathe-animalier"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-card active:scale-[0.98]"
                  >
                    Voir la page compte rendu
                  </Link>
                </div>
              </div>

              <div className="landing-reveal landing-reveal-3 relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_42px_110px_-72px_rgba(20,18,28,0.52)]">
                <Image
                  src="/assets/images/dashboard-image.jpg"
                  alt="Interface Biume avec suivi de séance et informations animal"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/88 via-background/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Maillage SEO
                  </p>
                  <p className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-tight md:text-4xl">
                    Des articles reliés aux pages qui convertissent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
              {blogPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className="landing-reveal rounded-[1.7rem] border border-border bg-card p-6 transition-colors hover:border-primary/30 md:p-7"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {post.category}
                    </span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">
                    <Link href={post.path} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {post.summary}
                  </p>
                  <Link
                    href={post.path}
                    className="mt-6 inline-flex text-sm font-semibold text-primary hover:text-primary/78"
                  >
                    Lire l&apos;article
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

function BlogBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-[0.58] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--border) 72%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 62%, transparent) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
