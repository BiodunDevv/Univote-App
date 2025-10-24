import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { changePassword, isLoading } = useAuthStore();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (newPassword === "1234") {
      setError("Please choose a password different from the default");
      return false;
    }

    return true;
  };

  const handleCreatePassword = async () => {
    setError("");

    if (!validatePassword()) {
      return;
    }

    try {
      await changePassword(newPassword);

      Toast.show({
        type: "success",
        text1: "Password Created",
        text2: "Your account is now secured",
      });

      router.replace("/(tabs)");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create password";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Password Change Failed",
        text2: errorMessage,
      });
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
                  <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <Ionicons name="lock-closed" size={20} color="black" />
                  </View>
                  <Text className="text-black text-lg font-semibold">
                    Create New Password
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
                    {/* Title and Instructions */}
                    <View className="mb-6">
                      <Text className="text-black text-2xl font-bold mb-2">
                        SECURE YOUR ACCOUNT
                      </Text>
                      <Text className="text-gray-600 text-sm leading-5">
                        This is your first login. Please create a new password
                        to secure your account.
                      </Text>
                    </View>

                    {/* Info Banner */}
                    <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                      <View className="flex-row items-start">
                        <Ionicons
                          name="information-circle"
                          size={20}
                          color="#2563EB"
                          style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <View className="flex-1">
                          <Text className="text-blue-800 text-xs font-semibold mb-1">
                            Password Requirements:
                          </Text>
                          <Text className="text-blue-700 text-xs">
                            • At least 6 characters long{"\n"}• Different from
                            default password (1234){"\n"}• Must match
                            confirmation
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Form Fields */}
                    <View className="bg-white rounded-lg border border-gray-200 p-4">
                      {/* New Password */}
                      <View className="mb-4">
                        <Text className="text-gray-700 text-sm font-semibold mb-2">
                          New Password
                        </Text>
                        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                          <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            className="flex-1 px-4 py-3 text-sm text-black"
                            placeholderTextColor="#9CA3AF"
                          />
                          <Pressable
                            onPress={() => setShowNewPassword((s) => !s)}
                            className="px-3"
                            accessibilityLabel={
                              showNewPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            <Ionicons
                              name={showNewPassword ? "eye-off" : "eye"}
                              size={18}
                              color="#6B7280"
                            />
                          </Pressable>
                        </View>
                      </View>

                      {/* Confirm Password */}
                      <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2">
                          Confirm Password
                        </Text>
                        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                          <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter new password"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            className="flex-1 px-4 py-3 text-sm text-black"
                            placeholderTextColor="#9CA3AF"
                          />
                          <Pressable
                            onPress={() => setShowConfirmPassword((s) => !s)}
                            className="px-3"
                            accessibilityLabel={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            <Ionicons
                              name={showConfirmPassword ? "eye-off" : "eye"}
                              size={18}
                              color="#6B7280"
                            />
                          </Pressable>
                        </View>
                      </View>

                      {/* Error Message */}
                      {error ? (
                        <View className="mt-3 bg-red-50 rounded-lg p-3 border border-red-200">
                          <View className="flex-row items-center">
                            <Ionicons
                              name="alert-circle"
                              size={16}
                              color="#991B1B"
                              style={{ marginRight: 6 }}
                            />
                            <Text className="flex-1 text-red-800 text-xs">
                              {error}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Bottom Section */}
                  <View className="pb-6 pt-4">
                    {/* Create Password Button */}
                    <Pressable
                      onPress={handleCreatePassword}
                      disabled={isLoading}
                      className={`rounded-lg py-4 items-center flex-row justify-center ${
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
                        {isLoading ? "Creating Password..." : "CREATE PASSWORD"}
                      </Text>
                    </Pressable>
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
