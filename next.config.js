/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        'timers/promises': false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
