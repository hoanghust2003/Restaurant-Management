import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8000',
        pathname: '/assets/**',
      },
    ],
    unoptimized: true,
  },
  transpilePackages: ['@ant-design', '@ant-design/icons', 'antd'],
  // Tối ưu hiệu suất
  reactStrictMode: false, // Tắt strict mode để giảm số lượng render
  poweredByHeader: false, // Không gửi header X-Powered-By
  
  // Tracing removed to avoid permission issues
  
  // Advanced optimization options
  compiler: {
    // Xóa console log trong bản production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Enable styledComponents optimization
    styledComponents: true,
  },
  
  // Optimize bundle size
  modularizeImports: {
    '@ant-design/icons': {
      transform: '@ant-design/icons/lib/icons/${member}',
    },
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizeServerReact: true, // Optimize React on the server
    scrollRestoration: true, // Restore scroll position on navigation
  },

  // Ant Design v5 compatibility fixes
  webpack: (config) => {
    // Ant Design compatibility fixes
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ant-design/icons/lib/dist$': '@ant-design/icons/lib/index.js',
      '@ant-design/icons-svg': '@ant-design/icons-svg',
    };
    
    // Improve chunk loading
    if (config.optimization?.splitChunks) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
      };
    }

    return config;
  }
};

export default nextConfig;
