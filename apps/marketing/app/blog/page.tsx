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
      <div className="min-h-dvh overflow-x-hidden bg-[color:var(--v2-canvas)] text-[color:var(--v2-ink)] selection:bg-[color:var(--v2-accent)]/25">
        <main id="contenu" tabIndex={-1}>
          <section className="border-b border-[color:var(--v2-line)] px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
              <div>
                <p className="v2-eyebrow landing-reveal">
                  Ressources praticiens
                </p>
                <h1 className="v2-display landing-reveal landing-reveal-2 mt-5 max-w-[16ch] text-[clamp(2.7rem,6vw,5.4rem)] font-medium leading-[1.02] tracking-[-0.05em]">
                  Blog ostéopathe animalier
                </h1>
                <p className="landing-reveal landing-reveal-3 mt-6 max-w-[60ch] text-base leading-7 text-[color:var(--v2-ink-soft)] md:text-[1.05rem] md:leading-8">
                  Des guides courts pour améliorer vos comptes rendus, votre
                  suivi post-séance animal, vos relances propriétaire et votre
                  choix de logiciel ostéopathe animalier.
                </p>
                <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    className="v2-btn v2-btn-primary v2-btn-lg"
                  >
                    Essayer 15 jours gratuitement
                  </Link>
                  <Link
                    href="/compte-rendu-osteopathe-animalier"
                    className="v2-btn v2-btn-secondary v2-btn-lg"
                  >
                    Voir la page compte rendu
                  </Link>
                </div>
              </div>

              <div className="v2-panel landing-reveal landing-reveal-3 relative min-h-88 overflow-hidden p-2.5">
                <Image
                  src="/assets/images/dashboard-image.jpg"
                  alt="Interface Biume avec suivi de séance et informations animal"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[color:var(--v2-canvas)]/88 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="v2-eyebrow v2-eyebrow-green">
                    Maillage SEO
                  </p>
                  <p className="v2-display mt-3 max-w-md text-[clamp(1.7rem,3vw,2.8rem)] font-medium leading-[1.05] tracking-[-0.04em]">
                    Des articles reliés aux pages qui convertissent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className="v2-card landing-reveal p-7 transition-colors hover:bg-[color:var(--v2-bone)] md:p-8"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[color:var(--v2-ink-faint)]">
                    <span className="rounded-full bg-[color:var(--v2-violet-soft)] px-3 py-1 text-[color:var(--v2-violet-ink)]">
                      {post.category}
                    </span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="v2-display mt-5 text-2xl font-medium leading-[1.12] tracking-[-0.035em]">
                    <Link href={post.path} className="hover:text-[color:var(--v2-violet-ink)]">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--v2-ink-soft)]">
                    {post.summary}
                  </p>
                  <Link
                    href={post.path}
                    className="v2-link mt-6 inline-flex text-sm font-semibold text-[color:var(--v2-violet-ink)]"
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
