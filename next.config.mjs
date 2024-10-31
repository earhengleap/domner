import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "uploadthing.com",
      "utfs.io",
      "zepaucxftwzifiuogfxj.supabase.co", // Add this line
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "zepaucxftwzifiuogfxj.supabase.co", // Add this pattern
      },
    ],
  },
  publicRuntimeConfig: {
    staticFolder: "/public",
  },
  experimental: {
    
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
