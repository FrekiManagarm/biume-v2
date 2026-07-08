// source.config.ts
import { defineCollections } from "fumadocs-mdx/config";
import { z } from "zod";
var relatedLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1)
});
var blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().min(1),
    updatedAt: z.string().min(1).optional(),
    author: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    category: z.string().min(1).optional(),
    keyword: z.string().min(1).optional(),
    readingTime: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    takeaways: z.array(z.string().min(1)).default([]),
    relatedLinks: z.array(relatedLinkSchema).default([])
  })
});
export {
  blogPosts
};
