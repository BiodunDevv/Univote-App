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

export default function UpdatePassword() {
  const router = useRouter();
  const { updatePassword, isLoading } = useAuthStore();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword) {
      Toast.show({
        type: "error",
        text1: "Current password required",
        text2: "Please enter your current password",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      Toast.show({
        type: "error",
        text1: "New password required",
        text2: "Please enter a new password",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "New password must be at least 6 characters long",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords don't match",
        text2: "New password and confirmation must match",
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      Toast.show({
        type: "error",
        text1: "Same password",
        text2: "New password must be different from current password",
      });
      return;
    }

    try {
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      Toast.show({
        type: "success",
        text1: "Password updated successfully!",
        text2: "Your password has been changed",
      });

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2:
          error instanceof Error ? error.message : "Failed to update password",
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (
    password: string
  ): {
    strength: string;
    color: string;
    progress: number;
  } => {
    if (!password) return { strength: "None", color: "#D1D5DB", progress: 0 };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2)
      return { strength: "Weak", color: "#EF4444", progress: 0.33 };
    if (score <= 4)
      return { strength: "Medium", color: "#F59E0B", progress: 0.66 };
    return { strength: "Strong", color: "#10B981", progress: 1 };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const passwordChecks = [
    {
      label: "At least 6 characters",
      met: passwordForm.newPassword.length >= 6,
    },
  ];

  return (
    <View className="flex-1">
      <SafeAreaView className="bg-white" edges={["top"]} />
      <StatusBar style="dark" />
      <View className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              {/* Premium Header */}
              <View className="bg-white border-b border-gray-100">
                <View className="flex-row items-center px-5 pt-4 pb-3">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-black/5 items-center justify-center mr-3"
                  >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                  </Pressable>
                </View>

                <View className="px-5 pb-5">
                  <Text
                    className="text-black text-3xl font-bold"
                    style={{ letterSpacing: -1 }}
                  >
                    Update Password
                  </Text>
                </View>
              </View>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-1 px-5 py-6">
                  {/* Current Password */}
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      Current Password
                    </Text>
                    <View className="relative">
                      <TextInput
                        value={passwordForm.currentPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: text,
                          })
                        }
                        placeholder="Enter current password"
                        autoCapitalize="none"
                        className="bg-gray-50 rounded-lg px-4 py-3 text-sm border border-gray-200 text-black pr-12"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.current}
                        editable={!isLoading}
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-3 active:opacity-70"
                      >
                        <Ionicons
                          name={showPasswords.current ? "eye-off" : "eye"}
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* New Password */}
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      New Password
                    </Text>
                    <View className="relative">
                      <TextInput
                        value={passwordForm.newPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: text,
                          })
                        }
                        placeholder="Enter new password"
                        autoCapitalize="none"
                        className="bg-gray-50 rounded-lg px-4 py-3 text-sm border border-gray-200 text-black pr-12"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.new}
                        editable={!isLoading}
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-3 active:opacity-70"
                      >
                        <Ionicons
                          name={showPasswords.new ? "eye-off" : "eye"}
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword.length > 0 && (
                    <View className="mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-500 text-xs">
                          Password Strength
                        </Text>
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.strength}
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${passwordStrength.progress * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </View>
                    </View>
                  )}

                  {/* Confirm Password */}
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-2">
                      Confirm New Password
                    </Text>
                    <View className="relative">
                      <TextInput
                        value={passwordForm.confirmPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: text,
                          })
                        }
                        placeholder="Confirm new password"
                        autoCapitalize="none"
                        className="bg-gray-50 rounded-lg px-4 py-3 text-sm border border-gray-200 text-black pr-12"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPasswords.confirm}
                        editable={!isLoading}
                        autoCorrect={false}
                      />
                      <Pressable
                        onPress={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-3 active:opacity-70"
                      >
                        <Ionicons
                          name={showPasswords.confirm ? "eye-off" : "eye"}
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>
                  {passwordForm.confirmPassword.length > 0 &&
                    passwordForm.newPassword !==
                      passwordForm.confirmPassword && (
                      <View className="flex-row items-center mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color="#EF4444"
                        />
                        <Text className="text-red-600 text-xs ml-2">
                          Passwords do not match
                        </Text>
                      </View>
                    )}

                  {/* Password Requirements */}
                  <View className="mb-4">
                    {passwordChecks.map((check, index) => (
                      <View key={index} className="flex-row items-center py-2">
                        <View
                          className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
                            check.met ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <Ionicons
                            name={check.met ? "checkmark" : "close"}
                            size={12}
                            color="white"
                          />
                        </View>
                        <Text
                          className={`text-sm ${
                            check.met ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {check.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Spacer */}
                  <View className="flex-1" />

                  {/* Action Buttons */}
                  <View className="pt-6">
                    {/* Update Button */}
                    <Pressable
                      onPress={handleUpdatePassword}
                      disabled={
                        isLoading ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                      }
                      className={`${
                        isLoading ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword !==
                          passwordForm.confirmPassword
                          ? "bg-gray-100 border border-gray-200"
                          : "bg-black active:opacity-80"
                      } rounded-xl py-4 items-center mb-3 flex-row justify-center`}
                    >
                      {isLoading && (
                        <ActivityIndicator
                          size="small"
                          color={
                            isLoading ||
                            !passwordForm.currentPassword ||
                            !passwordForm.newPassword ||
                            !passwordForm.confirmPassword ||
                            passwordForm.newPassword !==
                              passwordForm.confirmPassword
                              ? "#9CA3AF"
                              : "white"
                          }
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        className={`text-base ${
                          isLoading ||
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword ||
                          passwordForm.newPassword !==
                            passwordForm.confirmPassword
                            ? "text-gray-400"
                            : "text-white"
                        }`}
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </Text>
                    </Pressable>

                    {/* Cancel Button */}
                    <Pressable
                      onPress={() => router.back()}
                      disabled={isLoading}
                      className="bg-white rounded-xl py-4 items-center border border-gray-200 active:bg-gray-50"
                    >
                      <Text className="text-gray-600 text-base">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </View>
  );
}
