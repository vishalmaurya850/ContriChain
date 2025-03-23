/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // ✅ Set as an object instead of boolean
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        dns: false,
        net: false,
        tls: false,
        "mongodb-client-encryption": false,
        "kerberos": false,
        "@mongodb-js/zstd": false,
        "@aws-sdk/credential-providers": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
