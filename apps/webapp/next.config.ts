import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    incomingRequests: true,
    serverFunctions: true,
  }
}
 
export default nextConfig