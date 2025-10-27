import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HAS_SEEN_ONBOARDING = "@univote_has_seen_onboarding";
const TOKEN_KEY = "@univote_token";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAppState = async () => {
      try {
        // Check if user is authenticated
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        setTimeout(() => {
          if (token) {
            // User is logged in - go to current-user
            router.replace("/current-user" as any);
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
        setTimeout(() => {
          router.replace("/welcome" as any);
        }, 2500);
      }
    };

    checkAppState();
  }, [router]);

  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-white" edges={[]}>
        <StatusBar style="dark" />
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
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </>
  );
}
