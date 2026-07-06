import type { Metadata } from "next";

export const siteUrl = "https://biume.com";
export const siteName = "Biume";

type BreadcrumbItem = {
  name: string;
  path: string;
};

const parentBreadcrumbLabels: Record<string, string> = {
  alternatives: "Alternatives",
  blog: "Blog",
  comparatifs: "Comparatifs",
};

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path === "/" ? "" : path}`;
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function pageBreadcrumbJsonLd({
  path,
  name,
}: {
  path: string;
  name: string;
}) {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}`;
  const segments = normalizedPath === "/" ? [] : normalizedPath.slice(1).split("/");
  const items: BreadcrumbItem[] = [{ name: "Accueil", path: "/" }];

  const parentSegment = segments[0];

  if (segments.length > 1 && parentSegment) {
    items.push({
      name: parentBreadcrumbLabels[parentSegment] ?? parentSegment,
      path: `/${parentSegment}`,
    });
  }

  if (normalizedPath !== "/") {
    items.push({ name, path: normalizedPath });
  }

  return breadcrumbJsonLd(items);
}
