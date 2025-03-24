/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // ✅ Set as an object instead of boolean
  },
  webpack: (config, { isServer }) => {
    config.externals = config.externals || {};
    config.externals['@napi-rs/snappy'] = 'commonjs @napi-rs/snappy';

    if (!isServer) {
      config.resolve.fallback = {
        events: false,
        process: false,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        "timers/promises": false,
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
