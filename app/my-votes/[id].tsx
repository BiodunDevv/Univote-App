import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function SessionVoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { votingHistory, isLoading, fetchVotingHistory } = useVotingStore();

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

  // Find the specific voting session from history
  const sessionVote = useMemo(() => {
    return votingHistory.find((history) => history.session.id === id);
  }, [votingHistory, id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading vote details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionVote) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-900 text-xl font-bold mt-4 mb-2">
            Vote Not Found
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-6">
            This voting record could not be found.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-black px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={[]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View className="bg-white border-b border-gray-100">
          <View className="flex-row items-center px-5 pt-4 pb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/5 items-center justify-center mr-3 active:opacity-70"
            >
              <Ionicons name="chevron-back" size={20} color="#000" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-black text-lg font-bold">Your Votes</Text>
            </View>
            <View className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <Text className="text-xs font-bold uppercase text-green-600">
                {sessionVote.votes.length} VOTE
                {sessionVote.votes.length !== 1 ? "S" : ""}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Session Info */}
          <View className="bg-white m-4 rounded-xl p-5 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={20} color="#000" />
              <Text className="text-xs font-bold text-gray-500 uppercase ml-2">
                Voting Session
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {sessionVote.session.title}
            </Text>
            {sessionVote.session.description && (
              <Text className="text-gray-600 text-sm mb-3">
                {sessionVote.session.description}
              </Text>
            )}
            <View className="pt-3 border-t border-gray-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-2">
                  <Text className="font-semibold">Voted on: </Text>
                  {new Date(sessionVote.voted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-2">
                  <Text className="font-semibold">Period: </Text>
                  {new Date(sessionVote.session.start_time).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}{" "}
                  -{" "}
                  {new Date(sessionVote.session.end_time).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Votes List */}
          <View className="mx-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="checkmark-done-circle"
                size={20}
                color="#22C55E"
              />
              <Text className="text-xs font-bold text-gray-700 uppercase ml-2">
                Your Selections
              </Text>
            </View>

            {sessionVote.votes.map((vote, index) => (
              <View
                key={vote.id || `vote-${index}`}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
              >
                {/* Position Badge */}
                <View className="mb-3">
                  <View className="bg-blue-50 px-3 py-1.5 rounded-lg self-start border border-blue-200">
                    <Text className="text-blue-700 text-xs font-bold uppercase">
                      {vote.position}
                    </Text>
                  </View>
                </View>

                {/* Candidate Info */}
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: vote.candidate.photo_url }}
                    className="w-16 h-16 rounded-2xl"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-900 text-base font-bold mb-1">
                      {vote.candidate.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Candidate ID: {vote.candidate.id}
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center border-2 border-green-200">
                    <Ionicons name="checkmark" size={20} color="#22C55E" />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Summary Card */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 mx-4 mb-6 rounded-xl p-5 border border-green-200">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center">
                <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-green-900 text-base font-bold mb-1">
                  Vote Successfully Recorded
                </Text>
                <Text className="text-green-700 text-xs">
                  Your {sessionVote.votes.length} vote
                  {sessionVote.votes.length !== 1 ? "s have" : " has"} been
                  securely recorded and will be counted in the final results.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
