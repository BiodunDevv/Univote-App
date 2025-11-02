import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
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
import { getDeviceInfo } from "../../utils/deviceInfo";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default function VoteConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    sessionTitle: string;
    selectedCandidates: string; // JSON stringified object of { position: { id, name } }
    requiresLocation: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
    locationName?: string;
  }>();

  const { submitVote } = useVotingStore();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const requiresLocation = params.requiresLocation === "true";

  // Parse selected candidates
  const selectedCandidates = params.selectedCandidates
    ? JSON.parse(params.selectedCandidates)
    : {};

  const handleRequestCameraPermission = async () => {
    const { granted } = await requestCameraPermission();
    if (granted) {
      setShowCamera(true);
    } else {
      Alert.alert(
        "Permission Required",
        "Camera access is required to verify your identity before voting.",
        [{ text: "OK" }]
      );
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      Toast.show({
        type: "info",
        text1: "Capturing photo...",
        text2: "Please hold still",
        visibilityTime: 1000,
      });

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        Toast.show({
          type: "success",
          text1: "Photo captured!",
          text2: "Review your photo below",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Toast.show({
        type: "error",
        text1: "Failed to capture photo",
        text2: "Please try again",
      });
    }
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    setCloudinaryUrl(null);
    setShowCamera(true);
  };

  const uploadToCloudinary = async () => {
    if (!photoUri) {
      Toast.show({
        type: "error",
        text1: "No Photo",
        text2: "Please take a photo first",
      });
      return;
    }

    setIsUploadingToCloudinary(true);

    try {
      Toast.show({
        type: "info",
        text1: "Uploading photo...",
        text2: "Please wait",
      });

      // Create form data
      const formData = new FormData();

      // Add the image file
      const filename = photoUri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: photoUri,
        name: filename,
        type: type,
      } as any);

      formData.append(
        "upload_preset",
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ProfileX"
      );

      // Upload to Cloudinary
      const cloudName =
        process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "df4f0usnh";
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      // Store the Cloudinary URL
      setCloudinaryUrl(data.secure_url);

      Toast.show({
        type: "success",
        text1: "Photo Uploaded!",
        text2: "Your photo has been uploaded successfully",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to upload photo. Please try again.",
        visibilityTime: 4000,
      });
    } finally {
      setIsUploadingToCloudinary(false);
    }
  };

  const validateLocationAndSubmit = async () => {
    if (!photoUri) {
      Toast.show({
        type: "error",
        text1: "Photo Required",
        text2: "Please take a photo to verify your identity",
      });
      return;
    }

    if (!cloudinaryUrl) {
      Toast.show({
        type: "error",
        text1: "Upload Required",
        text2: "Please upload your photo to Cloudinary first",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Always get location (required by API)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Location access is required to vote. Please enable location services.",
          [{ text: "OK" }]
        );
        setIsSubmitting(false);
        return;
      }

      // Get current location
      Toast.show({
        type: "info",
        text1: "Getting location...",
        text2: "Please wait",
      });

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Display location info to user
      Toast.show({
        type: "success",
        text1: "Location acquired",
        text2: `Lat: ${locationData.latitude.toFixed(6)}, Long: ${locationData.longitude.toFixed(6)}`,
        visibilityTime: 3000,
      });

      // Validate geofence if required (client-side check before API call)
      if (
        requiresLocation &&
        params.latitude &&
        params.longitude &&
        params.radius
      ) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          parseFloat(params.latitude),
          parseFloat(params.longitude)
        );

        const allowedRadius = parseFloat(params.radius);
        if (distance > allowedRadius) {
          Alert.alert(
            "Location Error",
            `You must be within ${allowedRadius}m of ${params.locationName || "the voting location"} to vote. You are currently ${Math.round(distance)}m away.`,
            [{ text: "OK" }]
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Get device info
      const deviceId = await getDeviceInfo();

      // Build choices array for session-based voting
      const choices = Object.entries(selectedCandidates).map(
        ([position, candidate]: [string, any]) => ({
          candidate_id: candidate.id,
          category: position,
        })
      );

      await submitVote(
        params.sessionId,
        choices,
        cloudinaryUrl!, // Use the Cloudinary URL
        locationData,
        deviceId
      );

      // Show success message with all votes
      const voteList = Object.entries(selectedCandidates)
        .map(
          ([position, candidate]: [string, any]) =>
            `• ${position}: ${candidate.name}`
        )
        .join("\n");

      Alert.alert(
        "Vote Submitted Successfully!",
        `You voted for:\n${voteList}\n\nThank you for participating!`,
        [
          {
            text: "View Results",
            onPress: () =>
              router.replace({
                pathname: "/voting/live-results",
                params: { sessionId: params.sessionId },
              }),
          },
          {
            text: "Done",
            onPress: () => router.replace("/(tabs)/vote"),
          },
        ]
      );
    } catch (error) {
      console.error("Error during vote submission:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Camera view
  if (showCamera) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
        <StatusBar style="light" />
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="front"
            mirror={true}
          />

          {/* Overlay UI - positioned absolutely over the camera */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            pointerEvents="box-none"
          >
            {/* Header */}
            <View className="px-6 pt-4">
              <Pressable
                onPress={() => setShowCamera(false)}
                className="bg-black/60 w-12 h-12 rounded-full items-center justify-center active:opacity-80"
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>

            {/* Face Guide Oval */}
            <View
              style={{
                position: "absolute",
                top: "20%",
                left: "15%",
                right: "15%",
                height: "40%",
                borderWidth: 3,
                borderColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 200,
                borderStyle: "dashed",
              }}
              pointerEvents="none"
            />

            {/* Instructions */}
            <View className="absolute bottom-48 left-0 right-0 px-8">
              <View className="bg-black/80 p-5 rounded-2xl">
                <Text className="text-white text-center text-lg font-bold mb-2">
                  Position Your Face
                </Text>
                <Text className="text-white/90 text-center text-sm leading-5">
                  Center your face within the oval frame.{"\n"}
                  Ensure good lighting and look directly at the camera.
                </Text>
              </View>
            </View>

            {/* Capture Button */}
            <View className="absolute bottom-10 left-0 right-0 items-center">
              <View className="items-center">
                <Pressable
                  onPress={takePicture}
                  className="w-20 h-20 rounded-full border-4 border-white bg-transparent items-center justify-center active:opacity-70"
                >
                  <View className="w-16 h-16 rounded-full bg-white" />
                </Pressable>
                <Text className="text-white text-xs mt-3 font-semibold">
                  TAP TO CAPTURE
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main confirmation view
  return (
    <>
      <SafeAreaView className="bg-white" edges={["top"]} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={[]}>
        <StatusBar style="dark" />

        {/* Professional Header */}
        <View className="bg-white border-b border-gray-100">
          <View className="flex-row items-center px-5 pt-4 pb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/5 items-center justify-center mr-3 active:opacity-70"
            >
              <Ionicons name="chevron-back" size={20} color="#000" />
            </Pressable>
            <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#3b82f6"
              />
              <Text className="text-blue-600 text-xs font-bold ml-1.5">
                VERIFICATION
              </Text>
            </View>
          </View>

          <View className="px-5 pb-4">
            <Text className="text-black text-4xl font-bold mb-2">
              Confirm Your Vote
            </Text>
            <Text className="text-gray-500 text-sm">
              Review your selections and verify your identity
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5 py-4">
          {/* Vote Summary */}
          <View className="bg-white rounded-xl p-5 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={20} color="#000" />
              <Text
                className="text-xs font-bold text-gray-500 uppercase ml-2"
                style={{ letterSpacing: 0.5 }}
              >
                Your Selection
              </Text>
            </View>
            <Text
              className="text-black text-xl font-bold mb-4"
              style={{ letterSpacing: -0.5 }}
            >
              {params.sessionTitle}
            </Text>

            {Object.entries(selectedCandidates).map(
              ([position, candidate]: [string, any], index) => (
                <View
                  key={position}
                  className={`py-3 ${index !== Object.keys(selectedCandidates).length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <Text
                    className="text-gray-500 text-xs mb-1.5 font-semibold uppercase"
                    style={{ letterSpacing: 0.3 }}
                  >
                    {position}
                  </Text>
                  <Text
                    className="text-black text-base font-bold"
                    style={{ letterSpacing: -0.3 }}
                  >
                    {candidate.name}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Photo Verification */}
          <View className="bg-white rounded-xl p-5 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="camera" size={20} color="#000" />
                <Text
                  className="text-black text-base font-bold ml-2"
                  style={{ letterSpacing: -0.3 }}
                >
                  Identity Verification
                </Text>
              </View>
              {photoUri && (
                <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
              )}
            </View>

            {photoUri ? (
              <View>
                <View className="bg-gray-100 rounded-xl overflow-hidden mb-3">
                  <Image
                    source={{ uri: photoUri }}
                    className="w-full h-80"
                    resizeMode="contain"
                  />
                </View>

                {cloudinaryUrl ? (
                  <View className="mb-3">
                    <View className="flex-row items-center justify-center mb-2 bg-green-50 py-2 px-4 rounded-lg">
                      <Ionicons name="cloud-done" size={18} color="#22c55e" />
                      <Text className="text-green-700 text-sm font-semibold ml-2">
                        Photo uploaded to Cloudinary
                      </Text>
                    </View>
                    <Text
                      className="text-gray-500 text-xs text-center px-2"
                      numberOfLines={1}
                    >
                      {cloudinaryUrl}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={uploadToCloudinary}
                    disabled={isUploadingToCloudinary}
                    className={`rounded-xl py-3.5 mb-3 ${isUploadingToCloudinary ? "bg-gray-300" : "bg-blue-600"} active:opacity-80`}
                  >
                    {isUploadingToCloudinary ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text
                          className="text-white text-sm font-bold ml-2"
                          style={{ letterSpacing: -0.3 }}
                        >
                          Uploading...
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="cloud-upload" size={18} color="#fff" />
                        <Text
                          className="text-white text-sm font-bold ml-2"
                          style={{ letterSpacing: -0.3 }}
                        >
                          Upload to Cloudinary
                        </Text>
                      </View>
                    )}
                  </Pressable>
                )}

                <Pressable
                  onPress={retakePhoto}
                  className="bg-gray-100 rounded-xl py-3.5 active:opacity-80 border border-gray-200"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="camera-reverse" size={18} color="#000" />
                    <Text
                      className="text-black text-sm font-bold ml-2"
                      style={{ letterSpacing: -0.3 }}
                    >
                      Retake Photo
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text
                  className="text-gray-600 text-sm mb-4"
                  style={{ lineHeight: 20 }}
                >
                  Take a selfie to verify your identity
                </Text>
                <Pressable
                  onPress={
                    cameraPermission?.granted
                      ? () => setShowCamera(true)
                      : handleRequestCameraPermission
                  }
                  className="bg-black rounded-xl py-3.5 active:opacity-80"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="camera"
                      size={18}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className="text-white text-sm font-bold"
                      style={{ letterSpacing: -0.3 }}
                    >
                      Take Photo
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>

          {/* Location Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color="#3b82f6" />
              <Text
                className="text-blue-700 font-bold ml-2 text-sm"
                style={{ letterSpacing: -0.2 }}
              >
                Location Verification
              </Text>
            </View>
            <Text className="text-blue-600 text-xs" style={{ lineHeight: 18 }}>
              {requiresLocation && params.locationName
                ? `You must be at ${params.locationName} to vote. Your location will be verified when you submit.`
                : "Your location will be captured and verified when you submit your vote."}
            </Text>
          </View>

          {/* Warning */}
          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#6B7280"
                style={{ marginTop: 2 }}
              />
              <Text
                className="text-gray-600 text-xs ml-2.5 flex-1"
                style={{ lineHeight: 18 }}
              >
                Once submitted, your vote cannot be changed. Please ensure this
                is your final choice.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={validateLocationAndSubmit}
            disabled={isSubmitting || !cloudinaryUrl}
            className={`rounded-xl py-4 mb-6 shadow-lg active:opacity-80 ${
              isSubmitting || !cloudinaryUrl
                ? "bg-gray-100 border border-gray-200"
                : "bg-black"
            }`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator
                  color={isSubmitting || !cloudinaryUrl ? "#9CA3AF" : "white"}
                  size="small"
                />
                <Text
                  className={`text-base font-bold ml-2 ${isSubmitting || !cloudinaryUrl ? "text-gray-400" : "text-white"}`}
                  style={{ letterSpacing: -0.3 }}
                >
                  Submitting Vote...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={isSubmitting || !cloudinaryUrl ? "#9CA3AF" : "#fff"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  className={`text-base font-bold ${isSubmitting || !cloudinaryUrl ? "text-gray-400" : "text-white"}`}
                  style={{ letterSpacing: -0.3 }}
                >
                  {cloudinaryUrl ? "Submit All Votes" : "Upload Photo First"}
                </Text>
              </View>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <SafeAreaView className="bg-white" edges={["bottom"]} />
    </>
  );
}
