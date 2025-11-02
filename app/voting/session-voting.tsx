import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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

export default function SessionVotingScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { currentSession, isLoading, fetchSessionDetail } = useVotingStore();
  const [selectedCandidates, setSelectedCandidates] = useState<{
    [position: string]: { id: string; name: string };
  }>({});

  useEffect(() => {
    if (sessionId) {
      loadSessionDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSessionDetail = async () => {
    try {
      await fetchSessionDetail(sessionId);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load session",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const selectCandidate = (
    position: string,
    candidateId: string,
    candidateName: string
  ) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: { id: candidateId, name: candidateName },
    }));
  };

  const isPositionSelected = (position: string) => {
    return !!selectedCandidates[position];
  };

  const isCandidateSelected = (position: string, candidateId: string) => {
    return selectedCandidates[position]?.id === candidateId;
  };

  const canProceedToConfirmation = () => {
    if (!currentSession) return false;
    const positions = Object.keys(currentSession.candidates_by_position);
    return positions.every((position) => selectedCandidates[position]);
  };

  const proceedToConfirmation = () => {
    if (!canProceedToConfirmation()) {
      Toast.show({
        type: "error",
        text1: "Incomplete Selection",
        text2: "Please select a candidate for each position",
      });
      return;
    }

    router.push({
      pathname: "/voting/vote-confirmation",
      params: {
        sessionId: sessionId,
        sessionTitle: currentSession!.title,
        selectedCandidates: JSON.stringify(selectedCandidates),
        requiresLocation: currentSession!.location ? "true" : "false",
        latitude: currentSession!.location?.latitude?.toString() || "",
        longitude: currentSession!.location?.longitude?.toString() || "",
        radius: currentSession!.location?.radius?.toString() || "",
        locationName: "Campus",
      },
    });
  };

  if (isLoading) {
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

  if (!currentSession) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text className="text-gray-600 mt-4 text-center text-base">
            Session not found
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

  const positions = Object.keys(currentSession.candidates_by_position);
  const selectedCount = Object.keys(selectedCandidates).length;
  const progressPercentage = (selectedCount / positions.length) * 100;

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
          </View>

          {/* Session Title */}
          <View className="px-5 pb-4">
            <Text className="text-black text-4xl font-bold mb-2">
              {currentSession.title}
            </Text>
            <Text className="text-gray-500 text-sm">
              Select one candidate for each position to continue
            </Text>
          </View>

          {/* Progress Section */}
          <View className="px-5 pb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-600 text-xs font-semibold">
                PROGRESS
              </Text>
              <Text className="text-gray-900 text-sm font-bold">
                {selectedCount}/{positions.length}
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                style={{ width: `${progressPercentage}%` }}
                className={`h-full rounded-full ${selectedCount === positions.length ? "bg-green-500" : "bg-black"}`}
              />
            </View>
          </View>
        </View>

        {/* Positions and Candidates */}
        <ScrollView className="flex-1">
          {positions.map((position) => {
            const candidates = currentSession.candidates_by_position[position];
            const isSelected = isPositionSelected(position);

            return (
              <View key={position} className="bg-white mb-2">
                {/* Position Header */}
                <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text
                      className="text-black text-xl font-bold"
                      style={{ letterSpacing: -0.5 }}
                    >
                      {position}
                    </Text>
                    <Text
                      className="text-gray-500 text-xs mt-1"
                      style={{ letterSpacing: 0.3 }}
                    >
                      Select one candidate
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500">
                      <Text
                        className="text-green-600 text-xs font-bold uppercase"
                        style={{ letterSpacing: 0.5 }}
                      >
                        Selected
                      </Text>
                    </View>
                  )}
                </View>

                {/* Candidates */}
                <View className="px-5 py-2">
                  {candidates.map((candidate, index) => {
                    const selected = isCandidateSelected(
                      position,
                      candidate.id
                    );

                    return (
                      <Pressable
                        key={candidate.id}
                        onPress={() =>
                          selectCandidate(
                            position,
                            candidate.id,
                            candidate.name
                          )
                        }
                        className={`flex-row items-center py-4 ${
                          index !== candidates.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <Image
                          source={{ uri: candidate.photo_url }}
                          className="w-14 h-14 rounded-2xl"
                        />

                        <View className="flex-1 ml-4">
                          <Text
                            className={`text-base font-bold ${
                              selected ? "text-black" : "text-gray-900"
                            }`}
                            style={{ letterSpacing: -0.3 }}
                          >
                            {candidate.name}
                          </Text>
                          {candidate.bio && (
                            <Text
                              className="text-gray-500 text-xs mt-1"
                              numberOfLines={1}
                              style={{ lineHeight: 16 }}
                            >
                              {candidate.bio}
                            </Text>
                          )}
                        </View>

                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            selected
                              ? "bg-black border-black"
                              : "border-gray-300"
                          }`}
                        >
                          {selected && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
          <Pressable
            onPress={proceedToConfirmation}
            disabled={!canProceedToConfirmation()}
            className={`rounded-xl py-4 flex-row items-center justify-center shadow-lg active:opacity-80 ${
              canProceedToConfirmation()
                ? "bg-black"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            {canProceedToConfirmation() && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              className={`text-base font-bold ${
                canProceedToConfirmation() ? "text-white" : "text-gray-400"
              }`}
              style={{ letterSpacing: -0.3 }}
            >
              {canProceedToConfirmation()
                ? "Continue to Confirmation"
                : `Select ${positions.length - selectedCount} more position${positions.length - selectedCount !== 1 ? "s" : ""}`}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </>
  );
}
