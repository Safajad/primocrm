/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/meta-webhook',
        destination: 'http://localhost:8001/meta-webhook',
      },
    ]
  },
}

export default nextConfig
