import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function VoteScreen() {
  const router = useRouter();
  const { sessions, isLoading, fetchSessions } = useVotingStore();
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "ended">(
    "all"
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadSessions = async () => {
    try {
      await fetchSessions(filter);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load sessions",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSessions(filter);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load sessions",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    }
    setRefreshing(false);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleTimeString()}`;
  };

  const renderSessionCard = ({ item }: { item: any }) => {
    const isActive = item.status === "active";
    const hasVoted = item.has_voted;

    // Get status badge border and text color
    const getStatusBadgeStyle = () => {
      switch (item.status) {
        case "active":
          return {
            bg: "bg-green-50",
            text: "text-green-600",
            border: "border-green-500",
          };
        case "upcoming":
          return {
            bg: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-500",
          };
        case "ended":
          return {
            bg: "bg-gray-50",
            text: "text-gray-600",
            border: "border-gray-400",
          };
        default:
          return {
            bg: "bg-gray-50",
            text: "text-black",
            border: "border-black",
          };
      }
    };

    const statusStyle = getStatusBadgeStyle();

    return (
      <Pressable
        className="bg-white mb-3 rounded-lg border border-gray-200 active:bg-gray-50"
        onPress={() => {
          router.push({
            pathname: "/voting/session-detail",
            params: { sessionId: item._id },
          });
        }}
      >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 text-lg font-bold mb-1">
                {item.title}
              </Text>
              <Text className="text-gray-500 text-xs">
                {formatDateRange(item.start_time, item.end_time)}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-md border ${statusStyle.border} ${statusStyle.bg}`}
            >
              <Text className={`${statusStyle.text} text-xs font-semibold`}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Description */}
          {item.description && (
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Footer */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1.5">
                {item.candidate_count} candidate
                {item.candidate_count !== 1 ? "s" : ""}
              </Text>
            </View>

            {hasVoted && (
              <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-md border border-green-200">
                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                <Text className="text-green-600 text-xs font-semibold ml-1">
                  Voted
                </Text>
              </View>
            )}

            {isActive && !hasVoted && (
              <Pressable className="bg-black px-4 py-1.5 rounded-md active:opacity-90">
                <Text className="text-white text-xs font-semibold">
                  Vote Now
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading && sessions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading sessions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Professional Header - UniVote Greatness */}
      <View className="bg-white border-b border-gray-100">
        <View className="px-5 pt-4 pb-5">
          {/* Bold Title */}
          <Text className="text-black text-4xl font-bold mb-2">UniVote</Text>

          {/* Subtitle */}
          <Text className="text-gray-500 text-sm">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}{" "}
            available
          </Text>
        </View>

        {/* Filter Tabs */}
        <View className="px-5 pb-4">
          <View className="flex-row">
            {(["all", "active", "upcoming", "ended"] as const).map((status) => (
              <Pressable
                key={status}
                className={`mr-2 px-4 py-2 rounded-lg ${
                  filter === status ? "bg-black" : "bg-gray-100"
                }`}
                onPress={() => {
                  if (filter !== status) {
                    setFilter(status);
                  }
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    filter === status ? "text-white" : "text-gray-600"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Session List */}
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={sessions}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000"
              colors={["#000"]}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="py-20 items-center bg-white rounded-lg border border-gray-200">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                  <Ionicons name="calendar-outline" size={28} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 font-semibold text-base mb-1">
                  No sessions found
                </Text>
                <Text className="text-gray-500 text-sm">
                  {filter !== "all"
                    ? `No ${filter} sessions available`
                    : "Check back later for new voting sessions"}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
