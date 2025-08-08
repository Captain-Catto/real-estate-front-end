import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from "@/services/authService";

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
  isAuthenticated: false,
  loading: false,
  error: null,
  lastLoginTime: null,
  isInitialized: false,
  sessionExpired: false,
};

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
  } catch (error: unknown) {
    // Vẫn logout local nếu có lỗi từ server
    console.error("Logout error:", error);
    return null;
  }
});

export const logoutAllAsync = createAsyncThunk("auth/logoutAll", async () => {
  try {
    await authService.logoutAll();
    return null;
  } catch (error: unknown) {
    // Vẫn logout local nếu có lỗi từ server
    console.error("Logout all error:", error);
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

    // Initialize auth from storage (for app startup)
    initializeAuth: (state) => {
      // Kiểm tra môi trường browser
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          state.isAuthenticated = true;
          state.loading = false;
          state.isInitialized = true;
          // User sẽ được load từ getProfileAsync
        } else {
          state.isAuthenticated = false;
          state.loading = false;
          state.user = null;
          state.isInitialized = true;
        }
      } else {
        // Server-side: không có token
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.isInitialized = true;
      }
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
        state.isAuthenticated = true;
        state.lastLoginTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
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
        state.isAuthenticated = true;
        state.lastLoginTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.loading = false;
        // Vẫn logout local
        state.user = null;
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
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
      })
      .addCase(logoutAllAsync.rejected, (state) => {
        state.loading = false;
        // Vẫn logout local
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastLoginTime = null;
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
          state.isAuthenticated = false;
          state.sessionExpired = true;
          // Xóa token từ localStorage an toàn
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
          }
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
  initializeAuth,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
