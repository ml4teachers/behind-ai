/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  
  // Disable Turbopack for Vercel deployment
  experimental: {
    turbo: false
  }
};

module.exports = nextConfig;
