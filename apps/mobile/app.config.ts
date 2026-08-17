import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Biume",
  slug: "biume",
  scheme: "biume",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/images/icon.png",
  ios: {
    bundleIdentifier: "com.biume.mobile",
    supportsTablet: false,
    icon: "./assets/expo.icon",
    infoPlist: {
      NSMicrophoneUsageDescription:
        "Biume utilise le microphone pour enregistrer votre dictée de séance.",
    },
  },
  android: {
    package: "com.biume.mobile",
    permissions: ["RECORD_AUDIO"],
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    "expo-background-task",
    [
      "expo-audio",
      {
        microphonePermission:
          "Biume utilise le microphone pour enregistrer votre dictée de séance.",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default { expo: config };
