import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();

  const handleSignin = () => {
    router.push("/auth/signin");
  };

  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-white" edges={[]}>
        <StatusBar style="dark" />
        <View className="flex-1">
          {/* Logo Section */}
          <View className="items-center justify-center px-6 pt-12 pb-8">
            <View className="w-24 h-24 items-center justify-center mb-6">
              <Image
                source={require("../../assets/images/logoDark.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-black text-3xl font-bold mb-2 text-center">
              UNIVOTE
            </Text>
            <Text className="text-gray-600 text-sm leading-5 text-center px-4">
              Secure University Voting System
            </Text>
          </View>

          {/* Main Content Card */}
          <View className="flex-1 px-6">
            <View className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Info Banner */}
              <View className="bg-blue-50 rounded-lg p-4 flex-row items-start border border-blue-200 mb-6">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="information" size={18} color="#2563EB" />
                </View>
                <Text className="flex-1 text-blue-800 text-xs leading-5">
                  Students can sign in using their matric number and password to
                  participate in university elections.
                </Text>
              </View>

              {/* Action Buttons */}
              <View>
                {/* Sign In Button - Primary */}
                <Pressable
                  onPress={handleSignin}
                  className="bg-black rounded-lg py-4 mb-3 flex-row items-center justify-center"
                >
                  <MaterialIcons
                    name="login"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white text-base font-semibold">
                    Sign In
                  </Text>
                </Pressable>

                {/* Terms and Privacy */}
                <View className="items-center px-2 mt-6">
                  <Text className="text-gray-500 text-xs text-center leading-5">
                    By continuing, you agree to our{" "}
                    <Text className="text-gray-900 font-semibold">
                      User Agreement
                    </Text>{" "}
                    and{" "}
                    <Text className="text-gray-900 font-semibold">
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-8" />
        </View>
      </SafeAreaView>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </>
  );
}
