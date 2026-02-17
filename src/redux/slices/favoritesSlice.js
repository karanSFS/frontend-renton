import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const toggleFavoriteAsync = createAsyncThunk(
    'favorites/toggle',
    async (vehicleId, thunkAPI) => {
        try {
            const response = await api.put('/auth/favorites', { vehicleId });
            // API returns updated favorites array
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    items: [], // Array of vehicle IDs
    isLoading: false,
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        setFavorites: (state, action) => {
            state.items = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                state.items = action.payload; // Sync with backend
            });
    }
});

export const { setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
