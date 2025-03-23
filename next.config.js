/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          net: false,
          tls: false,
          fs: false,
          child_process: false,
        };
      }
      return config;
    },
  };
  
  module.exports = nextConfig;  