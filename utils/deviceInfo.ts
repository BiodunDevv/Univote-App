import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";

/**
 * Generates a unique device identifier string using Expo APIs
 * Format: Brand Model (OS Version) - App vX.X.X - ID: unique-id
 * Example: Apple iPhone 14 Pro (iOS 16.5) - App v1.0.0 - ID: A1B2C3D4-E5F6-7890
 */
export const getDeviceInfo = async (): Promise<string> => {
  try {
    // Get device information
    const brand = Device.brand || "Unknown Brand"; // e.g., "Apple", "Samsung"
    const modelName = Device.modelName || Device.deviceName || "Unknown Model"; // e.g., "iPhone 13", "Galaxy S21"
    const osName = Device.osName || "Unknown OS"; // e.g., "iOS", "Android"
    const osVersion = Device.osVersion || "0"; // e.g., "15.0"

    // Get app version
    const appVersion = Application.nativeApplicationVersion || "1.0.0";

    // Generate a unique device identifier
    // For iOS: use identifierForVendor (unique per app vendor)
    // For Android: use androidId (unique per app installation)
    let deviceId: string;
    if (Device.osName === "iOS") {
      deviceId =
        (await Application.getIosIdForVendorAsync()) || Constants.sessionId;
    } else {
      deviceId = Application.getAndroidId() || Constants.sessionId;
    }

    // Combine into a unique device identifier
    const deviceInfo = `${brand} ${modelName} (${osName} ${osVersion}) - App v${appVersion} - ID: ${deviceId}`;

    return deviceInfo;
  } catch (error) {
    console.error("Error getting device info:", error);
    return "Unknown Device";
  }
};
