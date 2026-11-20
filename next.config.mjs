/** @type {import('next').NextConfig} */
const nextConfig = {
  // anime.js v3 ships a CJS build; treat as external to avoid bundling issues
  transpilePackages: [],
  async rewrites() {
    return [
      { source: '/mathquest', destination: '/mathquest/index.html' },
      { source: '/mathquest/teacher', destination: '/mathquest/teacher.html' },
    ];
  },
};

export default nextConfig;
