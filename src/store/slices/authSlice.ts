import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from "@/services/authService";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: number;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  lastLoginTime: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastLoginTime: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        return {
          user: response.data?.user,
          accessToken: response.data?.accessToken,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng nhập thất bại");
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
          user: response.data?.user,
          accessToken: response.data?.accessToken,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng ký thất bại");
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      // Vẫn logout local nếu có lỗi từ server
      console.error("Logout error:", error);
      return null;
    }
  }
);

export const logoutAllAsync = createAsyncThunk(
  "auth/logoutAll",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutAll();
      return null;
    } catch (error: any) {
      // Vẫn logout local nếu có lỗi từ server
      console.error("Logout all error:", error);
      return null;
    }
  }
);

export const getProfileAsync = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        return response.data.user;
      } else {
        return rejectWithValue("Không thể lấy thông tin profile");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi khi lấy thông tin profile");
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async (
    profileData: { username?: string; email?: string; phoneNumber?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        return response.data.user;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Cập nhật profile thất bại");
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

    // Initialize auth from storage (for app startup)
    initializeAuth: (state) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        state.isAuthenticated = true;
        state.loading = false; // Quan trọng: set loading = false
        // User sẽ được load từ getProfileAsync
      } else {
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
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
        if (
          action.payload?.includes("expired") ||
          action.payload?.includes("invalid")
        ) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("accessToken");
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
  initializeAuth,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
