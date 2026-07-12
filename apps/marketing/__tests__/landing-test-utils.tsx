import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";

const landingImageConfig = {
  ...imageConfigDefault,
  qualities: [48, 55, 65, 75],
};

export const exactZeroOpacity =
  /\bopacity\s*:\s*(?:0+(?:\.0*)?|\.(?:0)+)(?![\d.eE+-])/;

export function textOnly(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderWithLandingImageConfig(children: ReactNode) {
  const environment = process.env as unknown as Record<string, unknown>;
  const key = "__NEXT_IMAGE_OPTS";
  const hadPreviousValue = Object.hasOwn(environment, key);
  const previousValue = environment[key];

  environment[key] = landingImageConfig;

  try {
    return renderToStaticMarkup(
      <ImageConfigContext.Provider value={landingImageConfig}>
        {children}
      </ImageConfigContext.Provider>,
    );
  } finally {
    if (hadPreviousValue) {
      environment[key] = previousValue;
    } else {
      delete environment[key];
    }
  }
}

export function conversionAnchors(html: string, id: string) {
  return Array.from(
    html.matchAll(
      new RegExp(`<a\\b(?=[^>]*data-conversion="${id}")[^>]*>`, "g"),
    ),
    (match) => match[0],
  );
}
