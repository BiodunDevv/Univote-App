import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SuccessToast = (props: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        width: "100%",
      }}
    >
      <View
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 13,
                fontWeight: "400",
              }}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const ErrorToastComponent = (props: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        width: "100%",
      }}
    >
      <View
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#EF4444",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="close-circle" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 13,
                fontWeight: "400",
              }}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const InfoToastComponent = (props: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        width: "100%",
      }}
    >
      <View
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#3B82F6",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="information-circle" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {props.text1}
          </Text>
          {props.text2 && (
            <Text
              style={{
                color: "#D1D5DB",
                fontSize: 13,
                fontWeight: "400",
              }}
            >
              {props.text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToastComponent {...props} />,
  info: (props: any) => <InfoToastComponent {...props} />,
};
