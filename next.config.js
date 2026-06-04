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
      // „KI im Einsatz" wurde auf EINE Seite (/privacy) verschlankt: alle früheren
      // Seiten der Sektion (deutsche UND englische Slugs) leiten dorthin um.
      // hardware-check & kosten waren zu volatil/technisch; der Rest ging in der
      // einen Datenschutz-/Nachrichten-Check-Seite auf.
      { source: '/lokal-vs-cloud', destination: '/privacy', permanent: true },
      { source: '/local-vs-cloud', destination: '/privacy', permanent: true },
      { source: '/kosten', destination: '/privacy', permanent: true },
      { source: '/costs', destination: '/privacy', permanent: true },
      { source: '/hardware-check', destination: '/privacy', permanent: true },
      { source: '/datenschutz', destination: '/privacy', permanent: true },
      { source: '/werkzeugwahl', destination: '/privacy', permanent: true },
      { source: '/choosing-tools', destination: '/privacy', permanent: true },
      // Thread 9: Die Multimodal-Seite zog von „KI im Einsatz" nach „Hinter den
      // Modellen" und heisst neu /multimodal (statt /model-types). Beide alten
      // URLs leiten dorthin (die deutsche /modell-typen sowieso, /model-types
      // war nur im Redesign-Branch je live).
      { source: '/modell-typen', destination: '/multimodal', permanent: true },
      { source: '/model-types', destination: '/multimodal', permanent: true },
    ]
  },
};

module.exports = nextConfig;
