import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "zepaucxftwzifiuogfxj.supabase.co" },
      { protocol: "https", hostname: "vxmpwsbmtfjsvlfuesii.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  publicRuntimeConfig: {
    staticFolder: "/public",
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.paypal.com https://www.sandbox.paypal.com;",
          },
        ],
      },
    ]
  },
};

export default nextConfig;