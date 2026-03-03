import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeromefrancis.nesthub',
  appName: 'NestHub',
  webDir: 'dist/public',
  server: {
    allowNavigation: [
      "localhost",
      "*.replit.com",
      "*.repl.co",
      "*"
    ],
    cleartext: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      iosClientId: "784322352708-cvegst2amdbaql5lff7ut2cva1dbpvfb.apps.googleusercontent.com",
      serverClientId: "784322352708-cvegst2amdbaql5lff7ut2cva1dbpvfb.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
