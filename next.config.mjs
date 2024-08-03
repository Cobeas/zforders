/** @type {import('next').NextConfig} */
const nextConfig = {
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
