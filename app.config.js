export default {
  expo: {
    name: "nommy-employee",
    slug: "nommy-employee",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nommy.employee"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.nommy.employee"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-local-authentication"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: process.env.API_URL || "https://app.payjob.io/api",
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};