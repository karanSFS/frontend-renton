import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Helper to get initial state
const getInitialState = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token') || (user && user.token);
        
        return {
            user: user || null,
            token: token || null,
            isAuthenticated: !!token,
            role: user ? user.role : 'guest',
            isLoading: false,
            isError: false,
            message: '',
        };
    } catch (e) {
        return {
            user: null,
            token: null,
            isAuthenticated: false,
            role: 'guest',
            isLoading: false,
            isError: false,
            message: '',
        };
    }
};

const initialState = getInitialState();

// Register User
export const register = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login User
export const login = createAsyncThunk(
    'auth/login',
    async (userData, thunkAPI) => {
        try {
            const response = await api.post('/auth/login', userData);
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update Profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, thunkAPI) => {
        try {
            // Important: api handles content-type for multipart/form-data via axios
            const response = await api.put('/auth/profile', profileData);
             if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Complete Onboarding
export const completeOnboarding = createAsyncThunk(
    'auth/completeOnboarding',
    async (onboardingData, thunkAPI) => {
        try {
            const response = await api.put('/auth/onboarding', onboardingData);
             if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get User Profile
export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('/auth/profile');
            // Backend returns full user object
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete Account
export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, thunkAPI) => {
        try {
            await api.delete('/auth/profile');
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, thunkAPI) => {
         try {
            const response = await api.post('/auth/forgotpassword', { email });
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ resetToken, password }, thunkAPI) => {
        try {
            const response = await api.put(`/auth/resetpassword/${resetToken}`, { password });
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        },
        logout: (state) => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.role = 'guest';
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
            if (state.user.token) {
                 localStorage.setItem('token', state.user.token);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token; // Ensure token is updated
                state.role = action.payload.role;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.isAuthenticated = false;
                state.token = null;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
                state.role = action.payload.role;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.isAuthenticated = false;
                state.token = null;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                 state.isLoading = false;
                 state.isAuthenticated = true;
                 state.user = action.payload;
                 state.token = action.payload.token; // Refresh token if present
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
             // Complete Onboarding
            .addCase(completeOnboarding.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(completeOnboarding.fulfilled, (state, action) => {
                 state.isLoading = false;
                 state.isAuthenticated = true;
                 state.user = action.payload;
                 state.token = action.payload.token; 
            })
            .addCase(completeOnboarding.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete Account
            .addCase(deleteAccount.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.token = null;
                state.role = 'guest';
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get User Profile
            .addCase(getUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                // DO NOT overwrite token unless GET returns one (only update data)
                // If backend returns stripped user, keep current token
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
