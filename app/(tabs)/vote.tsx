import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoteScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-white items-center justify-center"
      edges={["top", "bottom"]}
    >
      <Text className="text-black text-2xl font-bold">Vote Page</Text>
    </SafeAreaView>
  );
}
