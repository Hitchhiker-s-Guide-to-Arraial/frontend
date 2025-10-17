/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'q-xx.bstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lp-cms-production.imgix.net',
      },
    ],
  },
}

module.exports = nextConfig