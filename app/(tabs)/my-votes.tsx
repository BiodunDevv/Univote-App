import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function MyVotesScreen() {
  const router = useRouter();
  const { votingHistory, isLoading, fetchVotingHistory } = useVotingStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVotingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVotingHistory = async () => {
    try {
      await fetchVotingHistory();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load voting history",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVotingHistory();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading voting history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <Text className="text-black text-2xl font-bold">My Votes</Text>
        <Text className="text-gray-500 text-sm mt-1">
          View your voting history
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000"
            colors={["#000"]}
          />
        }
      >
        {votingHistory.length === 0 ? (
          // Empty State
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              No Voting History
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              You haven&apos;t voted in any sessions yet.{"\n"}Your voting
              history will appear here.
            </Text>
          </View>
        ) : (
          // Voting History List
          <View className="p-4">
            {votingHistory.map((history, index) => (
              <Pressable
                key={history.session.id}
                onPress={() =>
                  router.push({
                    pathname: "/my-votes/[id]",
                    params: { id: history.session.id },
                  })
                }
                className="bg-white rounded-xl mb-4 border border-gray-100 shadow-sm overflow-hidden active:opacity-80"
              >
                {/* Session Header */}
                <View className="p-5 pb-4 border-b border-gray-100">
                  <View className="flex-row items-center mb-2">
                    <View className="flex-1">
                      <Text className="text-gray-900 text-lg font-bold mb-1">
                        {history.session.title}
                      </Text>
                      {history.session.description && (
                        <Text
                          className="text-gray-600 text-sm mb-2"
                          numberOfLines={2}
                        >
                          {history.session.description}
                        </Text>
                      )}
                    </View>
                    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center ml-2">
                      <Ionicons
                        name="checkbox-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs ml-1">
                      Voted on{" "}
                      {new Date(history.voted_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Votes List */}
                <View className="px-5 py-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-700 text-xs font-semibold uppercase tracking-wide">
                      Your Votes ({history.votes.length})
                    </Text>
                    <View className="bg-green-50 px-2 py-1 rounded-full">
                      <Text className="text-green-600 text-xs font-bold">
                        {history.votes.length} Vote
                        {history.votes.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  {history.votes.map((vote, voteIndex) => (
                    <View
                      key={vote.id || `${history.session.id}-${voteIndex}`}
                      className={`flex-row items-center py-3 px-2 ${
                        voteIndex < history.votes.length - 1
                          ? "border-b border-gray-50"
                          : ""
                      }`}
                    >
                      {/* Candidate Photo */}
                      <Image
                        source={{ uri: vote.candidate.photo_url }}
                        className="w-14 h-14 rounded-xl"
                      />

                      {/* Candidate Info */}
                      <View className="flex-1 ml-3">
                        <Text className="text-gray-900 text-sm font-bold mb-1">
                          {vote.candidate.name}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="bg-gray-100 px-2 py-1 rounded-md">
                            <Text className="text-gray-600 text-xs font-medium">
                              {vote.position}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Checkmark Icon */}
                      <View className="w-7 h-7 rounded-full bg-green-50 items-center justify-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                      </View>
                    </View>
                  ))}
                </View>

                {/* Session Period Footer */}
                <View className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-gray-500 text-xs mb-0.5">
                        Session Period
                      </Text>
                      <Text className="text-gray-700 text-xs font-semibold">
                        {new Date(
                          history.session.start_time
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(history.session.end_time).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="chevron-forward-circle-outline"
                        size={16}
                        color="#3B82F6"
                      />
                      <Text className="text-blue-600 text-xs ml-1 font-semibold">
                        Tap to view details
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
