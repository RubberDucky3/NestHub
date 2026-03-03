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
      iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
      serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
