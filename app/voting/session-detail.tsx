import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

export default function SessionDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { currentSession, isLoading, fetchSessionDetail } = useVotingStore();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetail(sessionId).catch(() =>
        Toast.show({
          type: "error",
          text1: "Failed to load session",
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (currentSession?.candidates_by_position) {
      const positions = Object.keys(currentSession.candidates_by_position);
      if (positions.length > 0) setSelectedPosition(positions[0]);
    }
  }, [currentSession]);

  const handleStartVoting = () => {
    if (!currentSession?.eligible) {
      Alert.alert(
        "Not Eligible",
        currentSession?.eligibility_reason || "You are not eligible to vote"
      );
      return;
    }
    if (currentSession?.has_voted) {
      Alert.alert("Already Voted", "You have already cast your vote");
      return;
    }
    router.push({
      pathname: "/voting/session-voting",
      params: { sessionId: currentSession.id },
    });
  };

  const handleViewResults = () => {
    router.push({
      pathname:
        currentSession?.status === "active"
          ? "/voting/live-results"
          : "/voting/final-results",
      params: { sessionId: currentSession!.id },
    });
  };

  if (isLoading || !currentSession) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const positions = Object.keys(currentSession.candidates_by_position);
  const statusColors = {
    active: { border: "border-green-500", text: "text-green-600" },
    upcoming: { border: "border-blue-500", text: "text-blue-600" },
    ended: { border: "border-gray-400", text: "text-gray-600" },
  };
  const statusStyle =
    statusColors[currentSession.status as keyof typeof statusColors] ||
    statusColors.ended;

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
            <View className="flex-1" />
            {currentSession.has_voted && (
              <View className="bg-green-50 px-3 py-1.5 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                <Text className="text-green-600 text-xs font-semibold ml-1">
                  Voted
                </Text>
              </View>
            )}
          </View>

          {/* Title Section */}
          <View className="px-5 pb-5">
            <Text className="text-black text-4xl font-bold mb-3">
              {currentSession.title}
            </Text>
            <View className="flex-row items-center">
              <View
                className={`px-3 py-1 rounded-md border ${statusStyle.border}`}
              >
                <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                  {currentSession.status.toUpperCase()}
                </Text>
              </View>
              <View className="flex-row items-center ml-4">
                <Ionicons name="list-outline" size={14} color="#666" />
                <Text className="text-gray-500 text-xs ml-1">
                  {positions.length} Position{positions.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Description */}
          {currentSession.description && (
            <View className="bg-white px-5 py-4 mb-2">
              <Text className="text-gray-600 text-sm leading-5">
                {currentSession.description}
              </Text>
            </View>
          )}

          {/* Eligibility Banner */}
          {!currentSession.eligible && (
            <View className="bg-red-50 mx-5 my-2 px-4 py-3 rounded-lg border border-red-200 flex-row items-start">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <View className="flex-1 ml-3">
                <Text className="text-red-900 text-sm font-semibold mb-1">
                  Not Eligible to Vote
                </Text>
                <Text className="text-red-700 text-xs">
                  {currentSession.eligibility_reason}
                </Text>
              </View>
            </View>
          )}

          {/* Voting Period */}
          <View className="bg-white px-5 py-4 mb-2">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="time-outline" size={16} color="#000" />
              </View>
              <Text className="text-gray-900 text-sm font-semibold ml-2">
                Voting Period
              </Text>
            </View>
            <View className="ml-10">
              <View className="mb-2">
                <Text className="text-gray-500 text-xs mb-1">Starts</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {new Date(currentSession.start_time).toLocaleString()}
                </Text>
              </View>
              <View>
                <Text className="text-gray-500 text-xs mb-1">Ends</Text>
                <Text className="text-gray-900 text-sm font-medium">
                  {new Date(currentSession.end_time).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Location Requirement */}
          {!currentSession.is_off_campus_allowed && (
            <View className="bg-white px-5 py-4 mb-2">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="location-outline" size={16} color="#000" />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-900 text-sm font-semibold mb-0.5">
                    On-Campus Only
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    You must be on campus to cast your vote
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* View Results Button */}
          {(currentSession.status === "active" ||
            currentSession.status === "ended") && (
            <View className="px-5 py-3">
              <Pressable
                onPress={handleViewResults}
                className="bg-gray-100 rounded-lg py-3.5 flex-row items-center justify-center active:bg-gray-200 border border-gray-200"
              >
                <Ionicons
                  name={
                    currentSession.status === "active"
                      ? "stats-chart-outline"
                      : "trophy-outline"
                  }
                  size={18}
                  color="#000"
                />
                <Text className="text-gray-900 text-sm font-semibold ml-2">
                  {currentSession.status === "active"
                    ? "View Live Results"
                    : "View Final Results"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Candidates by Position */}
          <View className="bg-white mt-2">
            <View className="px-5 py-4 border-b border-gray-100">
              <Text className="text-gray-900 text-lg font-bold">
                Candidates
              </Text>
            </View>

            {/* Position Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="border-b border-gray-100"
            >
              <View className="flex-row px-5 py-3">
                {positions.map((position) => (
                  <Pressable
                    key={position}
                    onPress={() => setSelectedPosition(position)}
                    className={`px-4 py-2 rounded-full mr-2 ${
                      selectedPosition === position ? "bg-black" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedPosition === position
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {position}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Candidates List */}
            <View className="px-5">
              {selectedPosition &&
                currentSession?.candidates_by_position?.[selectedPosition]?.map(
                  (candidate, index, array) => (
                    <Pressable
                      key={candidate.id}
                      onPress={() => {
                        router.push({
                          pathname: "/voting/candidate-detail",
                          params: {
                            candidateId: candidate.id,
                            sessionId: sessionId,
                          },
                        });
                      }}
                      className={`py-4 active:bg-gray-50 ${
                        index < array.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: candidate.photo_url }}
                          className="w-14 h-14 rounded-lg"
                        />
                        <View className="flex-1 ml-3">
                          <Text className="text-gray-900 text-base font-semibold mb-1">
                            {candidate.name}
                          </Text>
                          {candidate.bio && (
                            <Text
                              className="text-gray-500 text-xs"
                              numberOfLines={2}
                            >
                              {candidate.bio}
                            </Text>
                          )}
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                    </Pressable>
                  )
                )}
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Fixed Start Voting Button */}
        {currentSession.status === "active" && !currentSession.has_voted && (
          <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
            <Pressable
              onPress={handleStartVoting}
              disabled={!currentSession.eligible}
              className={`${
                !currentSession.eligible
                  ? "bg-gray-100 border border-gray-200"
                  : "bg-black active:opacity-90"
              } rounded-lg py-4 items-center justify-center`}
            >
              <Text
                className={`text-base font-bold ${
                  !currentSession.eligible ? "text-gray-400" : "text-white"
                }`}
              >
                {currentSession.eligible ? "Start Voting" : "Not Eligible"}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </>
  );
}
