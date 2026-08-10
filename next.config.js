/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    transpilePackages: ['html-docx-js-typescript'],
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