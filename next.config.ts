import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  // Keep better-auth out of the Turbopack/webpack RSC bundle. Its Kysely
  // adapter dynamically imports bun-sqlite-dialect, which crashes Turbopack
  // chunk generation (AvailableModules::get) even when using Prisma.
  // Official better-auth recommendation for Next.js bundler resolution.
  serverExternalPackages: ["better-auth", "@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withContentCollections(nextConfig);
