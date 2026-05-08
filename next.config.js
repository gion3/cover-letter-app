/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'pdf-parse'],
    output: "standalone",
  },
}

module.exports = nextConfig
