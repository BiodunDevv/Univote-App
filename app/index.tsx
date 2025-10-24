import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HAS_SEEN_ONBOARDING = "@univote_has_seen_onboarding";
const TOKEN_KEY = "@univote_token";

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAppState = async () => {
      try {
        // Hide the default splash screen
        await ExpoSplashScreen.hideAsync();

        // Check if user is authenticated
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        setTimeout(() => {
          if (token) {
            // User is logged in - go to tabs
            router.replace("/(tabs)" as any);
          } else {
            // Check onboarding status
            const checkOnboarding = async () => {
              const hasSeen = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING);
              if (hasSeen === "true") {
                // Go directly to auth page
                router.replace("/auth" as any);
              } else {
                // Show welcome/onboarding
                router.replace("/welcome" as any);
              }
            };
            checkOnboarding();
          }
        }, 2500);
      } catch (error) {
        console.error("Error checking app state:", error);
        await ExpoSplashScreen.hideAsync();
        setTimeout(() => {
          router.replace("/welcome" as any);
        }, 2500);
      }
    };

    checkAppState();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        {/* Logo */}
        <Image
          source={require("../assets/images/logoDark.png")}
          className="w-32 h-32"
          resizeMode="contain"
        />

        {/* Loading Spinner at Bottom */}
        <View className="absolute bottom-32">
          <ActivityIndicator size="small" color="#000000" />
        </View>
      </View>
    </SafeAreaView>
  );
}
