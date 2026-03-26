import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Some versions need it here
  },
  // the error suggested top level for next.config.js/ts might be different
  // actually in newer next it might be under 'dev' or similar
  // but let's try top level first based on the text provided by the error
  allowedDevOrigins: ['192.168.56.1'],
} as any; // Bypass type check if it's a version mismatch but works runtime


export default nextConfig;
