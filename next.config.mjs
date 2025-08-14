/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => [
    {
      source: '/xue-signer/:call*',
      destination: `https://remote-signer.plopmenz.com/xue-signer${process.env.NEXT_PUBLIC_TESTNET ? '-testnet' : ''}/:call*`,
    },
  ],
  basePath: process.env.NEXT_PUBLIC_PREFIX,
  images: {
    remotePatterns: [
      {
        hostname: 'flagicons.lipis.dev',
        protocol: 'https',
        pathname: '/flags/*',
      },
    ],
  },
  reactStrictMode: false,
  webpack: (webpackConfig) => {
    // For web3modal
    webpackConfig.externals.push('pino-pretty', 'lokijs', 'encoding')
    return webpackConfig
  },
  images: {
    remotePatterns: [{ hostname: 'erc721.openxai.org'}],
  },
}

export default nextConfig
