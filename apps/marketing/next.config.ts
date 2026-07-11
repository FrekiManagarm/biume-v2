import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  images: {
    qualities: [65, 75],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
