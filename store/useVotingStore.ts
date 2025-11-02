import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://localhost:5000/api";

interface Session {
  _id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "ended";
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  is_off_campus_allowed: boolean;
  eligible_college?: string;
  has_voted: boolean;
  candidate_count: number;
  candidates?: Candidate[];
}

interface Candidate {
  _id: string;
  id: string;
  name: string;
  position: string;
  photo_url: string;
  bio?: string;
  manifesto?: string;
  vote_count?: number;
}

interface SessionDetail {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "ended";
  categories: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  is_off_campus_allowed: boolean;
  eligible: boolean;
  eligibility_reason?: string;
  has_voted: boolean;
  candidates_by_position: {
    [position: string]: Candidate[];
  };
  session?: {
    title: string;
    status: string;
    start_time: string;
    end_time: string;
  };
}

interface LiveResults {
  session: {
    title: string;
    is_live: boolean;
  };
  total_votes: number;
  last_updated: string;
  results: PositionResult[];
}

interface PositionResult {
  position: string;
  total_votes: number;
  candidates: CandidateResult[];
}

interface CandidateResult {
  id: string;
  name: string;
  vote_count: number;
  percentage: number;
  is_leading: boolean;
  is_winner?: boolean;
}

interface FinalResults {
  session: {
    title: string;
    start_time: string;
    end_time: string;
    results_public: boolean;
  };
  total_valid_votes: number;
  has_voted: boolean;
  results: PositionResult[];
}

interface VoteHistory {
  session: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
  };
  votes: {
    id: string;
    position: string;
    candidate: {
      id: string;
      name: string;
      photo_url: string;
    };
  }[];
  voted_at: string;
}

interface VoteDetail {
  id: string;
  student: {
    id: string;
    matric_no: string;
    full_name: string;
    email: string;
    college: string;
    department: string;
    level: string;
  } | null;
  session: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
  } | null;
  candidate: {
    id: string;
    name: string;
    position: string;
    photo_url: string;
    bio: string;
  } | null;
  position: string;
  geo_location: {
    lat: number;
    lng: number;
  };
  face_match_score: number;
  face_verification_passed: boolean;
  status: string;
  device_id: string;
  ip_address: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

interface VotingState {
  sessions: Session[];
  currentSession: SessionDetail | null;
  currentCandidate: Candidate | null;
  liveResults: LiveResults | null;
  finalResults: FinalResults | null;
  votingHistory: VoteHistory[];
  currentVote: VoteDetail | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: (filter?: string) => Promise<void>;
  fetchSessionDetail: (sessionId: string) => Promise<void>;
  fetchCandidateDetail: (candidateId: string) => Promise<void>;
  fetchLiveResults: (sessionId: string) => Promise<void>;
  fetchFinalResults: (sessionId: string) => Promise<void>;
  fetchVotingHistory: () => Promise<void>;
  fetchVoteById: (voteId: string) => Promise<void>;
  submitVote: (
    sessionId: string,
    choices: { candidate_id: string; category: string }[],
    photo: string,
    location: { latitude: number; longitude: number },
    deviceId?: string
  ) => Promise<void>;
  clearError: () => void;
}

export const useVotingStore = create<VotingState>((set, get) => ({
  sessions: [],
  currentSession: null,
  currentCandidate: null,
  liveResults: null,
  finalResults: null,
  votingHistory: [],
  currentVote: null,
  isLoading: false,
  error: null,

  fetchSessions: async (filter = "all") => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url =
        filter === "all"
          ? `${API_URL}/sessions`
          : `${API_URL}/sessions?status=${filter}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sessions");
      }

      set({ sessions: data.sessions, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch sessions";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchSessionDetail: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch session details");
      }

      set({ currentSession: data.session, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch session details";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchCandidateDetail: async (candidateId: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/sessions/candidates/${candidateId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch candidate details");
      }

      set({ currentCandidate: data.candidate, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch candidate details";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchLiveResults: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/sessions/${sessionId}/live-results`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch live results");
      }

      set({ liveResults: data, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch live results";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchFinalResults: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/results/${sessionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to fetch final results"
        );
      }

      set({ finalResults: data, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch final results";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  submitVote: async (
    sessionId: string,
    choices: { candidate_id: string; category: string }[],
    photo: string,
    location: { latitude: number; longitude: number },
    deviceId?: string
  ) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          choices: choices,
          image_url: photo,
          lat: location.latitude,
          lng: location.longitude,
          device_id: deviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === "ALREADY_VOTED") {
          throw new Error("ALREADY_VOTED");
        }
        if (data.code === "GEOFENCE_VIOLATION") {
          throw new Error("GEOFENCE_VIOLATION");
        }
        if (data.code === "NO_REGISTERED_FACE") {
          throw new Error("NO_REGISTERED_FACE");
        }
        if (data.code === "FACE_VERIFICATION_FAILED") {
          const error: any = new Error("FACE_VERIFICATION_FAILED");
          error.confidence = data.confidence;
          throw error;
        }
        throw new Error(data.error || "Failed to submit vote");
      }

      // Refresh sessions to update has_voted status
      await get().fetchSessions();

      set({ isLoading: false });

      return data; // Return the response for success message
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit vote";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchVotingHistory: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/vote/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch voting history");
      }

      set({ votingHistory: data.history, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch voting history";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchVoteById: async (voteId: string) => {
    try {
      set({ isLoading: true, error: null });

      const token = await AsyncStorage.getItem("@univote_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/vote/${voteId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vote details");
      }

      set({ currentVote: data.vote, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch vote details";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
