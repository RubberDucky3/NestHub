import { Capacitor } from "@capacitor/core";

export const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        return envUrl;
    }

    if (Capacitor.isNativePlatform()) {
        // IMPORTANT: In TestFlight/Production, 'localhost' will not work.
        // You MUST build with: VITE_API_URL=https://your-server.com npm run build
        // For local Wi-Fi testing, use your Mac's IP: http://192.168.1.XX:5001
        console.warn("NestHub: API URL defaulting to localhost on native platform. This will fail outside of a simulator.");
        return "http://localhost:5001";
    }

    return "";
};
