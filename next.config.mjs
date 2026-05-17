/** @type {import('next').NextConfig} */
const nextConfig = {
  // anime.js v3 ships a CJS build; treat as external to avoid bundling issues
  transpilePackages: [],
};

export default nextConfig;
