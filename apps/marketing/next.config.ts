import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  images: {
    qualities: [48, 55, 65, 75],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
