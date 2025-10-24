import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultsScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-white items-center justify-center"
      edges={["top", "bottom"]}
    >
      <Text className="text-black text-2xl font-bold">Results Page</Text>
    </SafeAreaView>
  );
}
