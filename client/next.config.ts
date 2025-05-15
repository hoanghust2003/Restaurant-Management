import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    unoptimized: true, // Disable image optimization to avoid issues with remote sources
  },
  // Tối ưu hiệu suất
  reactStrictMode: false, // Tắt strict mode để giảm số lượng render
  poweredByHeader: false, // Không gửi header X-Powered-By
  
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
  }
};

export default nextConfig;
