const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'profileMfe',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProfilePage': './app/profile/page.tsx',
          './ProfileInformation': './components/profile/ProfileInformation.tsx',
          './LoginPassword': './components/profile/LoginPassword.tsx',
          './CommunicationsPreferences': './components/profile/CommunicationsPreferences.tsx',
          './useProfile': './hooks/useProfile.ts',
          './ProfileTypes': './types/profile.ts',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '18.2.0',
            eager: true,
            strictVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '18.2.0',
            eager: true,
            strictVersion: false,
          },
          '@supabase/supabase-js': {
            singleton: true,
            strictVersion: false,
          },
          'date-fns': {
            singleton: true,
            strictVersion: false,
          },
          'lucide-react': {
            singleton: true,
            strictVersion: false,
          },
        },
      })
    );

    return config;
  },
};

module.exports = nextConfig;
