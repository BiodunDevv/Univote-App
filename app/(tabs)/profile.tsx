import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile, isLoading } =
    useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to refresh profile",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Logged out successfully",
      });
      router.replace("/auth");
    } catch {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Please try again",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000"
            colors={["#000"]}
          />
        }
      >
        {/* Profile Header Card */}
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          {/* Avatar */}
          <View className="items-center mb-5">
            <View className="w-28 h-28 rounded-full bg-black items-center justify-center shadow-lg">
              <Text className="text-white text-5xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name and Email */}
          <View className="items-center">
            <Text className="text-black text-2xl font-bold mb-1.5">
              {user.name}
            </Text>
            <Text className="text-gray-600 text-base mb-3">{user.email}</Text>
            <View className="px-4 py-1.5 bg-gray-100 rounded-full">
              <Text className="text-gray-700 text-xs font-semibold uppercase tracking-wide">
                Student
              </Text>
            </View>
          </View>
        </View>

        {/* Student Information */}
        <View className="bg-white mt-2 px-6 py-5">
          <Text className="text-black text-lg font-bold mb-5">
            Student Information
          </Text>

          <View className="space-y-4">
            {/* Matric Number */}
            <View className="flex-row items-center py-3.5 border-b border-gray-100">
              <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
                <Ionicons name="card-outline" size={22} color="#000" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1.5 font-medium">
                  Matric Number
                </Text>
                <Text className="text-black text-base font-semibold">
                  {user.matric_no || "N/A"}
                </Text>
              </View>
            </View>

            {/* Department */}
            <View className="flex-row items-center py-3.5 border-b border-gray-100">
              <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
                <Ionicons name="school-outline" size={22} color="#000" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1.5 font-medium">
                  Department
                </Text>
                <Text className="text-black text-base font-semibold">
                  {user.department || "N/A"}
                </Text>
              </View>
            </View>

            {/* College */}
            <View className="flex-row items-center py-3.5 border-b border-gray-100">
              <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
                <Ionicons name="business-outline" size={22} color="#000" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1.5 font-medium">
                  College
                </Text>
                <Text className="text-black text-base font-semibold">
                  {user.college || "N/A"}
                </Text>
              </View>
            </View>

            {/* Level */}
            <View className="flex-row items-center py-3.5">
              <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
                <Ionicons name="trophy-outline" size={22} color="#000" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1.5 font-medium">
                  Level
                </Text>
                <Text className="text-black text-base font-semibold">
                  {user.level || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="bg-white mt-2 px-6 py-5">
          <Text className="text-black text-lg font-bold mb-5">
            Account Settings
          </Text>
          {/* Change Password */}
          <Pressable
            onPress={() => router.push("/profile/update-password")}
            className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
              <Ionicons name="lock-closed-outline" size={22} color="#000" />
            </View>
            <Text className="text-black text-base flex-1 font-medium">
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>

          {/* Notifications */}
          <Pressable className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-50">
            <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
              <Ionicons name="notifications-outline" size={22} color="#000" />
            </View>
            <Text className="text-black text-base flex-1 font-medium">
              Notifications
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>
          {/* Help & Support */}
          <Pressable className="flex-row items-center py-4 active:bg-gray-50">
            <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3.5">
              <Ionicons name="help-circle-outline" size={22} color="#000" />
            </View>
            <Text className="text-black text-base flex-1 font-medium">
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={confirmLogout}
            disabled={loggingOut}
            className={`flex-row items-center justify-center py-4 rounded-xl shadow-sm active:opacity-80 ${
              loggingOut ? "bg-gray-400" : "bg-black"
            }`}
          >
            {loggingOut ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-bold">
                  Logging out...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-bold">Log Out</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
