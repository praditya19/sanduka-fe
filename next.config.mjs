/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "www.blibli.com",
      "media.suara.com",
      "via.placeholder.com",
      "picsum.photos",
      "sb.pgrikabupatenjepara.com",
    ],
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        ...config.externals,
        "jspdf-autotable": "jspdf-autotable",
      };
    }
    return config;
  },
};

export default nextConfig;
