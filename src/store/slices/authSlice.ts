import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, LoginResponse, User } from '@/types/auth';
import { authApi, apiClient, type ApiError } from '@/lib/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Token is automatically set in apiClient by authApi.login
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  }
  // Clear token from client
  apiClient.setToken(null);
  return;
});

export const verifyToken = createAsyncThunk<User, string>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      // Set token in client before verifying
      apiClient.setToken(token);
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Token verification failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
