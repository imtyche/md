/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 1. 移除了 output: 'standalone'（OpenNext/Cloudflare 不需要它）
    images: {
        unoptimized: true,
    },
    transpilePackages: ['html-docx-js-typescript'],

    // 2. 告诉 Turbopack 忽略 Webpack 的存在/允许空 Turbopack 配置
    turbo: {},

    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        }
        return config
    },
}

module.exports = nextConfig