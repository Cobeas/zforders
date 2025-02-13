/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/',
                destination: '/user/bestelformulier',
                permanent: true
            }
        ]
    }
};

export default nextConfig;
