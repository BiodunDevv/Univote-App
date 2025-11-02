import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function FinalResultsScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { finalResults, isLoading, fetchFinalResults } = useVotingStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadFinalResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadFinalResults = async () => {
    try {
      setError(null);
      await fetchFinalResults(sessionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load results";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Failed to load results",
        text2: errorMessage,
      });
    }
  };

  const shareResults = async () => {
    if (!finalResults) return;

    try {
      const message = `${finalResults.session.title}\n\nFinal Results:\n${finalResults.results
        .map(
          (position) =>
            `\n${position.position}:\n${position.candidates
              .filter((c) => c.is_winner)
              .map(
                (c) => `🏆 ${c.name} - ${c.vote_count} votes (${c.percentage}%)`
              )
              .join("\n")}`
        )
        .join("\n")}`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="information-circle-outline" size={64} color="#999" />
          <Text className="text-gray-600 mt-4 text-center text-base">
            {error}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-black px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!finalResults) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">No results available</Text>
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
            <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
              <Ionicons name="trophy-outline" size={14} color="#666" />
              <Text className="text-gray-700 text-xs font-bold ml-1.5">
                FINAL
              </Text>
            </View>
          </View>

          {/* Title */}
          <View className="px-5 pb-4">
            <Text className="text-black text-4xl font-bold mb-2">
              Final Results
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              {finalResults.session.title}
            </Text>

            {/* Stats Cards */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text className="text-xs text-gray-500 ml-1.5">
                    Total Votes
                  </Text>
                </View>
                <Text className="text-gray-900 text-2xl font-bold">
                  {finalResults.total_valid_votes}
                </Text>
              </View>

              {finalResults.has_voted && (
                <View className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#22c55e"
                    />
                    <Text className="text-xs text-green-600 ml-1.5">
                      You Voted
                    </Text>
                  </View>
                  <Text className="text-green-700 text-lg font-bold">✓</Text>
                </View>
              )}
            </View>

            {/* Share Button */}
            <Pressable
              onPress={shareResults}
              className="bg-black rounded-xl py-3.5 flex-row items-center justify-center shadow-sm active:opacity-80"
            >
              <Ionicons
                name="share-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-white text-sm font-bold"
                style={{ letterSpacing: -0.3 }}
              >
                Share Results
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Results */}
        <ScrollView className="flex-1">
          {finalResults.results.map((positionData, index) => (
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
                <View
                  key={candidate.id}
                  className={`py-4 ${candidateIndex < positionData.candidates.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${candidate.is_winner ? "bg-black" : "bg-gray-100"}`}
                    >
                      <Text
                        className={`text-sm font-bold ${candidate.is_winner ? "text-white" : "text-gray-600"}`}
                      >
                        {candidateIndex + 1}
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
                        {candidate.is_winner && (
                          <View className="ml-2 bg-black px-2.5 py-1 rounded-full">
                            <Text
                              className="text-white text-xs font-bold uppercase"
                              style={{ letterSpacing: 0.5 }}
                            >
                              Winner
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-gray-500 text-xs mt-0.5">
                        {candidate.vote_count} vote
                        {candidate.vote_count !== 1 ? "s" : ""} •{" "}
                        {candidate.percentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden ml-11">
                    <View
                      style={{
                        width: `${candidate.percentage}%`,
                        height: "100%",
                        backgroundColor: candidate.is_winner
                          ? "#000"
                          : "#6B7280",
                        borderRadius: 9999,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}

          {/* Election Info */}
          <View className="bg-white mb-2 px-5 py-4">
            <Text
              className="text-xs font-bold text-gray-500 uppercase mb-4"
              style={{ letterSpacing: 0.5 }}
            >
              Election Information
            </Text>
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-1">
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text className="text-gray-500 text-xs font-semibold ml-1.5">
                  Started
                </Text>
              </View>
              <Text
                className="text-black text-sm font-medium"
                style={{ lineHeight: 20 }}
              >
                {new Date(finalResults.session.start_time).toLocaleString()}
              </Text>
            </View>
            <View className="py-3 border-b border-gray-100">
              <View className="flex-row items-center mb-1">
                <Ionicons name="flag-outline" size={14} color="#666" />
                <Text className="text-gray-500 text-xs font-semibold ml-1.5">
                  Ended
                </Text>
              </View>
              <Text
                className="text-black text-sm font-medium"
                style={{ lineHeight: 20 }}
              >
                {new Date(finalResults.session.end_time).toLocaleString()}
              </Text>
            </View>
            <View className="py-3">
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={14}
                  color="#666"
                />
                <Text className="text-gray-500 text-xs font-semibold ml-1.5">
                  Status
                </Text>
              </View>
              <Text
                className="text-black text-sm font-medium"
                style={{ lineHeight: 20 }}
              >
                {finalResults.session.results_public ? "Published" : "Ended"}
              </Text>
            </View>
          </View>

          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </>
  );
}
