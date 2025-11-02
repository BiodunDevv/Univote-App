import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function LiveResultsScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { liveResults, isLoading, fetchLiveResults } = useVotingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadLiveResults();

      // Set up auto-refresh every 30 seconds
      intervalRef.current = setInterval(() => {
        loadLiveResults(true);
      }, 30000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadLiveResults = async (silent = false) => {
    try {
      if (!silent) {
        // Show loading state only for initial load
      }
      await fetchLiveResults(sessionId);
      setLastUpdated(new Date());
    } catch (error) {
      if (!silent) {
        Toast.show({
          type: "error",
          text1: "Failed to load results",
          text2: error instanceof Error ? error.message : "Please try again",
        });
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveResults();
    setRefreshing(false);
  };

  if (isLoading && !liveResults) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading live results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!liveResults) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="information-circle-outline" size={64} color="#CCC" />
          <Text className="text-gray-600 mt-4">No results available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={[]}>
        <StatusBar style="dark" />

        {/* Professional Header */}
        <View className="bg-white border-b border-gray-100">
          {/* Navigation */}
          <View className="flex-row items-center px-5 pt-4 pb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/5 items-center justify-center mr-3 active:opacity-70"
            >
              <Ionicons name="chevron-back" size={20} color="#000" />
            </Pressable>
            {liveResults.session.is_live && (
              <View className="flex-row items-center bg-black px-3 py-1.5 rounded-md">
                <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
                <Text className="text-white text-xs font-bold">LIVE</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <View className="px-5 pb-4">
            <Text className="text-black text-4xl font-bold mb-2">
              {liveResults.session.is_live ? "Live Results" : "Results"}
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              {liveResults.session.title}
            </Text>

            {/* Stats Cards */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text className="text-xs text-gray-500 ml-1.5">
                    Votes Cast
                  </Text>
                </View>
                <Text className="text-gray-900 text-2xl font-bold">
                  {liveResults.total_votes}
                </Text>
              </View>

              <View className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <View className="flex-row items-center mb-1">
                  <Ionicons
                    name={
                      liveResults.session.is_live
                        ? "pulse-outline"
                        : "flag-outline"
                    }
                    size={16}
                    color="#666"
                  />
                  <Text className="text-xs text-gray-500 ml-1.5">Status</Text>
                </View>
                <Text className="text-gray-900 text-lg font-bold">
                  {liveResults.session.is_live ? "Active" : "Ended"}
                </Text>
              </View>
            </View>

            {lastUpdated && (
              <View className="flex-row items-center justify-center py-3 mt-2">
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs text-gray-400 ml-1.5">
                  Updated {lastUpdated.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Results by Position */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000"
              colors={["#000"]}
            />
          }
        >
          {liveResults.results.map((positionData, index) => (
            <View key={index} className="bg-white mb-2 px-5 py-4">
              <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <View className="flex-1">
                  <Text
                    className="text-black text-xl font-bold"
                    style={{ letterSpacing: -0.5 }}
                  >
                    {positionData.position}
                  </Text>
                  <Text
                    className="text-gray-500 text-xs mt-1"
                    style={{ letterSpacing: 0.3 }}
                  >
                    {positionData.total_votes} vote
                    {positionData.total_votes !== 1 ? "s" : ""} cast
                  </Text>
                </View>
              </View>

              {positionData.candidates.map((candidate, candidateIndex) => (
                <CandidateResultCard
                  key={candidate.id}
                  candidate={candidate}
                  rank={candidateIndex + 1}
                  totalVotes={positionData.total_votes}
                  isLast={candidateIndex === positionData.candidates.length - 1}
                />
              ))}
            </View>
          ))}

          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </>
  );
}

// Candidate Result Card Component
function CandidateResultCard({
  candidate,
  rank,
  totalVotes,
  isLast,
}: {
  candidate: any;
  rank: number;
  totalVotes: number;
  isLast?: boolean;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: candidate.percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [candidate.percentage, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className={`py-4 ${!isLast ? "border-b border-gray-100" : ""}`}>
      <View className="flex-row items-center mb-3">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            rank === 1 ? "bg-black" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              rank === 1 ? "text-white" : "text-gray-600"
            }`}
          >
            {rank}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="text-black text-base font-bold"
              style={{ letterSpacing: -0.3 }}
            >
              {candidate.name}
            </Text>
            {candidate.is_leading && (
              <View className="ml-2 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500">
                <Text
                  className="text-green-600 text-xs font-bold uppercase"
                  style={{ letterSpacing: 0.5 }}
                >
                  Leading
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-xs mt-0.5">
            {candidate.vote_count} vote{candidate.vote_count !== 1 ? "s" : ""} •{" "}
            {candidate.percentage}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden ml-11">
        <Animated.View
          style={{
            width: progressWidth,
            height: "100%",
            backgroundColor: rank === 1 ? "#000" : "#6B7280",
            borderRadius: 9999,
          }}
        />
      </View>
    </View>
  );
}
