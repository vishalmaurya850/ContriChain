/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  experimental: {
    serverComponentsExternalPackages: [
      'mongodb',
      'firebase-admin',
      '@napi-rs/snappy-win32-x64-msvc',
      'snappy',
      'mongodb-client-encryption',
      'aws4',
      'kerberos',
      '@mongodb-js/zstd',
      'supports-color'
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client to avoid errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        mongodb: false,
        'mongodb-client-encryption': false,
        aws4: false,
        snappy: false,
        '@mongodb-js/zstd': false,
        kerberos: false,
        'supports-color': false,
        'node:events': false,
        'node:process': false,
        'node:util': false,
        'node:buffer': false,
        'node:stream': false,
        'node:path': false,
        'node:crypto': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:os': false,
        'node:url': false,
        'node:querystring': false,
        'node:assert': false,
      };
    }
    return config;
  },
};

export default nextConfig;