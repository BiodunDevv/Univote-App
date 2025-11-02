import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useVotingStore } from "../../store/useVotingStore";

const HEADER_MAX_HEIGHT = 480;
const HEADER_MIN_HEIGHT = 88;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function CandidateDetailScreen() {
  const router = useRouter();
  const { candidateId } = useLocalSearchParams<{
    candidateId: string;
    sessionId: string;
  }>();

  const { currentCandidate, isLoading, fetchCandidateDetail } =
    useVotingStore();
  const [error, setError] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (candidateId) {
      loadCandidateDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const loadCandidateDetail = async () => {
    try {
      setError(null);
      await fetchCandidateDetail(candidateId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load candidate details";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Failed to load details",
        text2: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Loading candidate...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentCandidate) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="person-circle-outline" size={64} color="#999" />
          <Text className="text-gray-600 mt-4 text-center text-base">
            {error || "Candidate not found"}
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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6, 0],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0, HEADER_SCROLL_DISTANCE],
    outputRange: [1.5, 1, 0.7],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_MAX_HEIGHT - 200, HEADER_MAX_HEIGHT - 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_MAX_HEIGHT - 150, HEADER_MAX_HEIGHT - 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const contentTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Animated Header with Image */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {currentCandidate && (
          <>
            <Animated.Image
              source={{ uri: currentCandidate.photo_url }}
              style={{
                width: "100%",
                height: HEADER_MAX_HEIGHT + 100,
                opacity: imageOpacity,
                transform: [{ scale: imageScale }],
              }}
              resizeMode="cover"
            />
            {/* Gradient overlays for better text visibility */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 160,
              }}
              className="bg-gradient-to-b from-black/80 via-black/40 to-transparent"
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 300,
              }}
              className="bg-gradient-to-t from-black via-black/80 to-transparent"
            />
            {/* Additional shadow overlay for text */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            />
          </>
        )}

        {/* Candidate name overlay on image */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 24,
            left: 20,
            right: 20,
            opacity: titleOpacity,
            transform: [{ scale: titleScale }],
          }}
        >
          <Text
            className="text-white text-5xl font-bold tracking-tight mb-3"
            style={{
              letterSpacing: -1,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            {currentCandidate.name}
          </Text>
          <View className="flex-row items-center">
            <View
              className="bg-white/25 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Text className="text-white text-sm font-semibold">
                {currentCandidate.position}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Collapsible Header Bar */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          opacity: headerTitleOpacity,
        }}
      >
        <View className="bg-black/95 backdrop-blur-xl border-b border-white/10">
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-4 h-14">
              <View className="flex-1 items-center">
                <Text
                  className="text-white text-base font-semibold"
                  numberOfLines={1}
                >
                  {currentCandidate.name}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Animated.View>

      {/* Floating Back Button */}
      <SafeAreaView
        edges={["top"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 30,
        }}
      >
        <View className="pl-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl items-center justify-center border border-white/20"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
      >
        {/* Main Content Card */}
        <Animated.View
          style={{
            transform: [{ translateY: contentTranslate }],
          }}
          className="bg-white"
        >
          {/* Info Section */}
          <View className="px-6 pt-8 pb-6">
            <Text
              className="text-black text-3xl font-bold tracking-tight mb-2"
              style={{ letterSpacing: -0.5 }}
            >
              {currentCandidate.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                <Text className="text-gray-900 text-xs font-semibold uppercase tracking-wider">
                  {currentCandidate.position}
                </Text>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          {currentCandidate.bio && (
            <View className="px-6 py-6 bg-gray-50/50">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-black rounded-full mr-3" />
                <Text className="text-black text-sm font-bold uppercase tracking-widest">
                  About
                </Text>
              </View>
              <Text
                className="text-gray-700 text-base leading-7 tracking-wide"
                style={{ lineHeight: 28 }}
              >
                {currentCandidate.bio}
              </Text>
            </View>
          )}

          {/* Manifesto Section */}
          {currentCandidate.manifesto && (
            <View className="px-6 py-6">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-black rounded-full mr-3" />
                <Text className="text-black text-sm font-bold uppercase tracking-widest">
                  Vision
                </Text>
              </View>
              <Text
                className="text-gray-700 text-base leading-7 tracking-wide"
                style={{ lineHeight: 28 }}
              >
                {currentCandidate.manifesto}
              </Text>
            </View>
          )}

          {/* Vote Count Section */}
          {currentCandidate.vote_count !== undefined && (
            <View className="px-6 py-6 bg-gray-50/50">
              <View className="flex-row items-center mb-4">
                <View className="w-1 h-5 bg-black rounded-full mr-3" />
                <Text className="text-black text-sm font-bold uppercase tracking-widest">
                  Vote Count  
                </Text>
              </View>
              <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                <Text
                  className="text-6xl font-bold text-black tracking-tight mb-2"
                  style={{ letterSpacing: -2 }}
                >
                  {currentCandidate.vote_count.toLocaleString()}
                </Text>
                <Text className="text-gray-500 text-sm uppercase tracking-widest font-medium">
                  Votes Received
                </Text>
              </View>
            </View>
          )}

          {/* Spacer */}
          <View className="h-40" />
        </Animated.View>
      </Animated.ScrollView>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
        <SafeAreaView edges={["bottom"]}>
          <View className="px-6 py-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-black rounded-2xl py-4 active:opacity-90"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-white text-center text-base font-semibold tracking-wide">
                Back to Candidates
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
