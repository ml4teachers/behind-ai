/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',

  // Disable Turbopack for Vercel deployment
  experimental: {},

  // Legacy-URL: /daten wurde zu /data. Exakter Match, damit die Asset-URLs
  // unter /daten/assets/* (public-Ordner) NICHT mitumgeleitet werden.
  async redirects() {
    return [
      {
        source: '/daten',
        destination: '/data',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
