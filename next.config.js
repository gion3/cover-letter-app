/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'pdf-parse'],
  },
}

module.exports = nextConfig
