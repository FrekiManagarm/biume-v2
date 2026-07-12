import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";

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
  return renderToStaticMarkup(
    <ImageConfigContext.Provider
      value={{ ...imageConfigDefault, qualities: [55, 65, 75] }}
    >
      {children}
    </ImageConfigContext.Provider>,
  );
}

export function conversionAnchors(html: string, id: string) {
  return Array.from(
    html.matchAll(
      new RegExp(`<a\\b(?=[^>]*data-conversion="${id}")[^>]*>`, "g"),
    ),
    (match) => match[0],
  );
}
