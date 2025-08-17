import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from "@/services/authService";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Types
export type UserRole = "admin" | "employee" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: UserRole;
  status?: "active" | "inactive" | "banned";
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null; // Lưu access token trong Redux memory
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  lastLoginTime: string | null;
  isInitialized: boolean;
  sessionExpired: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null, // Token chỉ lưu trong memory
  isAuthenticated: false,
  loading: false,
  error: null,
  lastLoginTime: null,
  isInitialized: false,
  sessionExpired: false,
};

// Restore authentication from refresh token (for app initialization)
export const restoreAuthAsync = createAsyncThunk(
  "auth/restoreAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Try to refresh the access token using the HTTP-only cookie
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Refresh token is invalid or expired
        return rejectWithValue("No valid refresh token found");
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        // Get user profile with the new access token directly
        // We'll set both token and user in the reducer, not here
        try {
          // Use fetchWithAuth from authService but with the new token directly
          const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.data.accessToken}`,
            },
            credentials: "include",
          });

          if (!profileResponse.ok) {
            return rejectWithValue("Failed to get user profile");
          }

          const profileData = await profileResponse.json();

          if (profileData.success) {
            return {
              accessToken: data.data.accessToken,
              user: profileData.data.user,
            };
          } else {
            return rejectWithValue("Failed to get user profile");
          }
        } catch {
          return rejectWithValue("Failed to fetch user profile");
        }
      }
      return rejectWithValue("Invalid refresh token response");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to restore authentication";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        return {
          user: response.data?.user as User,
          accessToken: response.data?.accessToken,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return {
          user: response.data?.user as User,
          accessToken: response.data?.accessToken,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
    return null;
  } catch {
    // Vẫn logout local nếu có lỗi từ server
    toast.error("Có lỗi khi đăng xuất, nhưng đã đăng xuất khỏi thiết bị này");
    return null;
  }
});

export const logoutAllAsync = createAsyncThunk("auth/logoutAll", async () => {
  try {
    await authService.logoutAll();
    return null;
  } catch {
    // Vẫn logout local nếu có lỗi từ server
    toast.error(
      "Có lỗi khi đăng xuất tất cả thiết bị, nhưng đã đăng xuất khỏi thiết bị này"
    );
    return null;
  }
});

export const getProfileAsync = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        return response.data.user as User;
      } else {
        return rejectWithValue("Không thể lấy thông tin profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy thông tin profile";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async (
    profileData: {
      username?: string;
      phoneNumber?: string;
      avatar?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        return response.data.user as User;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật profile thất bại";
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset auth state
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.lastLoginTime = null;
      state.isInitialized = false;
      state.sessionExpired = false;
    },

    // Update user profile
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set session expired
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.sessionExpired = action.payload;
      if (action.payload) {
        state.isAuthenticated = false;
        state.user = null;
      }
    },

    // Set user role
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },

    // Update user data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Set access token
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Initialize auth from storage (for app startup)
    initializeAuth: (state) => {
      // Với memory-only tokens, chỉ khởi tạo trạng thái không xác thực
      // Authentication sẽ được xác định qua refresh token trong HTTP-only cookie
      state.isAuthenticated = false;
      state.loading = true; // Set loading true để guards đợi
      state.user = null;
      state.accessToken = null;
      state.isInitialized = false; // Chỉ set true khi restore hoàn thành
      state.error = null;
      console.log("🔑 Auth state initializing, waiting for restore...");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken || null;
        state.isAuthenticated = true;
        state.lastLoginTime = new Date().toISOString();
        state.error = null;
        state.isInitialized = true;
        console.log("✅ Login successful, user authenticated");
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken || null;
        state.isAuthenticated = true;
        state.lastLoginTime = new Date().toISOString();
        state.error = null;
        state.isInitialized = true;
        console.log("✅ Registration successful, user authenticated");
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.loading = false;
        // Vẫn logout local
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      });

    // Logout All
    builder
      .addCase(logoutAllAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAllAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      })
      .addCase(logoutAllAsync.rejected, (state) => {
        state.loading = false;
        // Vẫn logout local
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      });

    // Restore Authentication
    builder
      .addCase(restoreAuthAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAuthAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user as User;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        state.sessionExpired = false;
        state.isInitialized = true;
      })
      .addCase(restoreAuthAsync.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
      });

    // Get Profile
    builder
      .addCase(getProfileAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Nếu không lấy được profile, có thể token đã expired
        const errorMessage = action.payload as string;
        if (
          errorMessage?.includes("expired") ||
          errorMessage?.includes("invalid") ||
          errorMessage?.includes("unauthorized")
        ) {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
          state.sessionExpired = true;
        }
      });

    // Update Profile
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  resetAuth,
  updateProfile,
  setLoading,
  setSessionExpired,
  setUserRole,
  setUser,
  setAccessToken,
  initializeAuth,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
