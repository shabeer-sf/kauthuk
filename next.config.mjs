/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("ssh2");
    }
    return config;
  },
  images: {
    domains: [
      'images.pexels.com', // Pexels image domain
      'greenglow.in'       // Added greenglow domain for images
    ],
  },
  experimental:{
    serverActions:{
      bodySizeLimit: '100mb',
    }
  }
  
};

export default nextConfig;
