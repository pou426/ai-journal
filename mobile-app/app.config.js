import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load the .env file from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default {
    expo: {
        name: "mobile-app",
        slug: "mobile-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.anonymous.mobile-app",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            package: "com.anonymous.mobileapp",
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                },
            ],
            [
                "@react-native-google-signin/google-signin",
                {
                    iosUrlScheme: process.env.IOS_URL_SCHEME,
                }
            ]
        ],
        experiments: {
            typedRoutes: true,
        }
    }
}