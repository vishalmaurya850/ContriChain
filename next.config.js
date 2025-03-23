/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'timers/promises': false,
        dns: false,
        socks: false,
        aws4: false,
        'mongodb-client-encryption': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;