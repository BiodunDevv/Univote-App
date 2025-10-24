import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";

export default function SigninScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [matricNo, setMatricNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignin = async () => {
    setError("");

    if (!matricNo || !password) {
      setError("Please enter both matric number and password");
      return;
    }

    try {
      await login(matricNo, password);

      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "Login successful",
      });

      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof Error && err.message === "FIRST_LOGIN") {
        // First login - redirect to create password
        Toast.show({
          type: "info",
          text1: "Password Change Required",
          text2: "Please create a new password",
        });
        router.replace("/auth/create-password");
      } else if (err instanceof Error && err.message === "NEW_DEVICE") {
        // New device detected - show alert and navigate to home
        Alert.alert(
          "New Device Detected",
          "You have logged in from a new device. A security email has been sent to your registered email address.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Invalid credentials";
        setError(errorMessage);
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: errorMessage,
        });
      }
    }
  };

  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-white" edges={[]}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Header */}
              <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
                  >
                    <Ionicons name="arrow-back" size={20} color="black" />
                  </Pressable>
                  <Text className="text-black text-lg font-semibold">
                    Sign In
                  </Text>
                </View>
              </View>

              {/* Scrollable Form Section */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-1 px-6 pt-6 justify-between">
                  <View className="flex-1">
                    {/* Welcome Text */}
                    <View className="mb-6">
                      <Text className="text-black text-2xl font-bold mb-2">
                        WELCOME TO UNIVOTE
                      </Text>
                      <Text className="text-gray-600 text-sm leading-5">
                        Sign in to participate in university elections and view
                        results
                      </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="bg-white rounded-lg border border-gray-200 p-4">
                      {/* Matric Number */}
                      <View className="mb-4">
                        <Text className="text-gray-700 text-sm font-semibold mb-2">
                          Matric Number
                        </Text>
                        <TextInput
                          value={matricNo}
                          onChangeText={setMatricNo}
                          placeholder="BU22CSC1001"
                          autoCapitalize="characters"
                          className="bg-gray-50 rounded-lg px-4 py-3 text-sm border border-gray-200 text-black"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>

                      {/* Password */}
                      <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2">
                          Password
                        </Text>
                        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                          <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            className="flex-1 px-4 py-3 text-sm text-black"
                            placeholderTextColor="#9CA3AF"
                          />
                          <Pressable
                            onPress={() => setShowPassword((s) => !s)}
                            className="px-3"
                            accessibilityLabel={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            <Ionicons
                              name={showPassword ? "eye-off" : "eye"}
                              size={18}
                              color="#6B7280"
                            />
                          </Pressable>
                        </View>
                      </View>

                      {/* Error Message */}
                      {error ? (
                        <View className="mt-3 bg-red-50 rounded-lg p-3 border border-red-200">
                          <Text className="text-red-800 text-xs">{error}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Bottom Section */}
                  <View className="pb-6 pt-4">
                    {/* Sign In Button */}
                    <Pressable
                      onPress={handleSignin}
                      disabled={isLoading}
                      className={`rounded-lg py-4 items-center mb-4 flex-row justify-center ${
                        isLoading ? "bg-gray-400" : "bg-black"
                      }`}
                    >
                      {isLoading && (
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className="text-white text-base font-semibold">
                        {isLoading ? "Signing in..." : "SIGN IN"}
                      </Text>
                    </Pressable>

                    {/* Help Text */}
                    <View className="items-center">
                      <Text className="text-gray-600 text-xs text-center">
                        Default password is{" "}
                        <Text className="font-semibold">1234</Text>
                      </Text>
                      <Text className="text-gray-600 text-xs text-center mt-1">
                        You&apos;ll be asked to change it on first login
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <SafeAreaView className="bg-black" edges={["bottom"]} />
    </>
  );
}
