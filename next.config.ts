import type { NextConfig } from "next";

const nextConfig = {
    output: 'export', // Tells Next.js to export static HTML files
    basePath: '/fonts-index', // Replace with your exact GitHub repo name
    images: {
      unoptimized: true, // Required because Next.js default image optimization needs a server
    },
};

export default nextConfig;
