import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { getDeviceInfo } from "../utils/deviceInfo";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://localhost:5000/api";
const TOKEN_KEY = "@univote_token";
const FIRST_LOGIN_TOKEN_KEY = "@univote_first_login_token";

interface Student {
  id: string;
  matric_no: string;
  full_name: string;
  email: string;
  department: string;
  college: string;
  level: string;
  has_voted_sessions: string[];
  is_logged_in: boolean;
  last_login_device: string;
  last_login_at: string;
  first_login: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: "student";
  matric_no: string;
  department: string;
  college: string;
  level: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  firstLoginToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (matricNo: string, password: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  firstLoginToken: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token) {
        set({ token, isAuthenticated: true });
        try {
          await get().fetchProfile();
        } catch (error: any) {
          // If it's a device changed error, show specific message
          if (
            error?.code === "DEVICE_CHANGED" ||
            error?.message === "DEVICE_CHANGED"
          ) {
            // Clear auth state and show message
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(FIRST_LOGIN_TOKEN_KEY);
            set({
              user: null,
              token: null,
              firstLoginToken: null,
              isAuthenticated: false,
            });
            // Throw the specific error so it can be caught by the UI
            throw new Error("DEVICE_CHANGED");
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Initialize error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (matricNo: string, password: string) => {
    try {
      set({ isLoading: true });

      // Get device information
      const deviceInfo = await getDeviceInfo();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matric_no: matricNo,
          password: password,
          device_id: deviceInfo,
        }),
      });

      const data = await response.json();

      // First login - password change required
      if (response.status === 403 && data.code === "FIRST_LOGIN") {
        const firstLoginToken = data.token;
        await AsyncStorage.setItem(FIRST_LOGIN_TOKEN_KEY, firstLoginToken);
        set({ firstLoginToken });
        throw new Error("FIRST_LOGIN");
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Successful login
      const token = data.token;
      const student: Student = data.student;
      const newDevice = data.new_device; // Flag for new device detection

      await AsyncStorage.setItem(TOKEN_KEY, token);

      const user: User = {
        id: student.id,
        email: student.email,
        name: student.full_name,
        role: "student",
        matric_no: student.matric_no,
        department: student.department,
        college: student.college,
        level: student.level,
      };

      set({
        token,
        user,
        isAuthenticated: true,
        firstLoginToken: null,
      });

      await AsyncStorage.removeItem(FIRST_LOGIN_TOKEN_KEY);

      // Return new_device flag for UI alert
      if (newDevice) {
        throw new Error("NEW_DEVICE");
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (newPassword: string) => {
    try {
      set({ isLoading: true });
      const firstLoginToken = get().firstLoginToken;

      if (!firstLoginToken) {
        throw new Error("No first login token found");
      }

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firstLoginToken}`,
        },
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password change failed");
      }

      // After successful password change, we get a new token
      const token = data.token;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.removeItem(FIRST_LOGIN_TOKEN_KEY);

      set({
        token,
        firstLoginToken: null,
        isAuthenticated: true,
      });

      // Fetch profile after password change
      await get().fetchProfile();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true });
      const token = get().token;

      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_URL}/auth/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      // Update token if backend returns a new one
      if (data.token) {
        const newToken = data.token;
        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        set({ token: newToken });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const token = get().token;

      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an authentication error (logged in on another device)
        if (response.status === 401 || response.status === 403) {
          const error: any = new Error("DEVICE_CHANGED");
          error.code = "DEVICE_CHANGED";
          throw error;
        }
        throw new Error(data.error || "Failed to fetch profile");
      }

      const student: Student = data.student;

      const user: User = {
        id: student.id || (student as any)._id,
        email: student.email,
        name: student.full_name,
        role: "student",
        matric_no: student.matric_no,
        department: student.department,
        college: student.college,
        level: student.level,
      };

      set({ user });
    } catch (error) {
      console.error("Fetch profile error:", error);
      // If fetch profile fails, likely token is invalid
      await get().logout();
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = get().token;

      if (token) {
        // Call logout API
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API response
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(FIRST_LOGIN_TOKEN_KEY);
      set({
        user: null,
        token: null,
        firstLoginToken: null,
        isAuthenticated: false,
      });
    }
  },
}));
