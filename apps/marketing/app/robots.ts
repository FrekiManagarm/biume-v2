import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/signin", "/signup", "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
