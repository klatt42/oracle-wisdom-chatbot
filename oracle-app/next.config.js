/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Updated configuration for Next.js 15.x
  serverExternalPackages: ['@anthropic-ai/sdk', 'openai'],
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Optimize for Netlify Functions deployment
    if (isServer) {
      config.externals = [...(config.externals || []), '@anthropic-ai/sdk', 'openai'];
    }
    
    return config;
  },
  // Ensure API routes are treated as serverless functions (default for App Router)
  // No 'output: export' - that would break API routes
};

module.exports = nextConfig;
