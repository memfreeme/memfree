/** @type {import('next').NextConfig} */
const { withContentlayer } = require('next-contentlayer2');
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
            },
        ],
    },
};

module.exports = withNextIntl(withContentlayer(nextConfig));
