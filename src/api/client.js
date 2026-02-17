import axios from 'axios';

// Create Axios Instance
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    // Do not set Content-Type here; let Axios set it automatically (json/multipart)
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // 1. Try to get token from standalone key
        let token = localStorage.getItem('token');
        
        // 2. Fallback to user object
        if (!token) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user && user.token) {
                token = user.token;
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // console.log('Attached Token:', token.substring(0, 10) + '...');
        } else {
            // console.warn('No token found');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Logging out...');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // Optional: Redirect to login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
