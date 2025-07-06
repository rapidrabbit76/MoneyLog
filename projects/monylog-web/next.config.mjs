/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export", // CSR/정적 export만 하도록 설정
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
