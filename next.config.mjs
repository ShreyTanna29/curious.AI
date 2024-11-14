/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains: [
            "faas-output-image.s3.ap-southeast-1.amazonaws.com",
        ]
    }
};

export default nextConfig;
