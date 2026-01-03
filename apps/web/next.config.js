/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    transpilePackages: ["@midia/shared"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "platform-lookaside.fbsbx.com",
            },
        ],
    },
};

module.exports = nextConfig;
