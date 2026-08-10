/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    transpilePackages: ['html-docx-js-typescript'],

    // 1. 兼容 Next.js 16 的 Turbopack 检查（覆盖新旧多种配置键名）
    turbo: {},
    turbopack: {},
    experimental: {
        turbo: {},
        turbopack: {},
    },

    // 2. 自定义 Webpack 配置
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