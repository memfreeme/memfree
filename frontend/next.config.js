/** @type {import('next').NextConfig} */
const { withContentlayer } = require('next-contentlayer2');

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
                hostname: 'image.memfree.me',
            },
        ],
    },
};

module.exports = withContentlayer(nextConfig);
