import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */
  reactCompiler: true,

  // Remove x-powered-by header for security and smaller response
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

export default nextConfig;
