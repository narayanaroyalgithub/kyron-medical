/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['twilio']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Vapi web SDK is browser-only — don't bundle on server
      config.externals = [...(config.externals || []), '@vapi-ai/web'];
    }
    return config;
  },
}

module.exports = nextConfig
