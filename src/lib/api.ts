const BASE_URL = "/api";
const STORAGE_KEY = "procurement_user_session";

export interface UserSession {
    id: string;
    email: string;
    full_name?: string;
    role: "admin" | "user";
}

interface RequestOptions extends RequestInit {
    data?: any;
}

/**
 * Generic fetch wrapper to handle JSON bodies and error parsing
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { data, headers, ...customConfig } = options;

    const config: RequestInit = {
        ...customConfig,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || `API Error: ${response.statusText}`);
        }

        return responseData;
    } catch (error: any) {
        console.error(`API Request Failed: ${endpoint}`, error);
        throw error;
    }
}

// ============================================================================
// API Client
// ============================================================================
export const api = {
    // get: <T>(endpoint: string, categoryFormData: { name: string; description: string; }) => request<T>(endpoint, { method: "GET" }),

    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

    post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: "POST", data }),

    put: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: "PUT", data }),

    patch: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: "PATCH", data }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),

    upload: async (endpoint: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        // We do NOT set Content-Type header here;
        // the browser sets it automatically with the correct boundary for FormData
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `Upload failed: ${res.statusText}`);
        }
        return res.json();
    },
};

export const auth = {
    getUser: (): UserSession | null => {
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) return null;
        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    },

    signIn: async (email: string, password: string) => {
        // Simulate network delay
        try {
            const response: any = await api.post('/auth/login', { email, password });
            const user = response.user;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            return { user, error: null };
        } catch (err: any) {
            return { user: null, error: err };
        }
    },

    signUp: async (email: string, password: string, fullName: string) => {
        try {
            await api.post('/auth/register', { email, password, full_name: fullName });
            // Auto login after register? Or just return success.
            // Let's just return success and make them login.
            return { error: null };
        } catch (err: any) {
            return { error: err };
        }
    },

    // New function to create admin
    createAdmin: async (requesterId: string, email: string, password: string, fullName: string) => {
        return api.post('/auth/create-admin', {
            requester_id: requesterId, email, password, full_name: fullName
        });
    },

    /**
     * Sign out (clear local storage)
     */
    signOut: async () => {
        localStorage.removeItem(STORAGE_KEY);
        // Optional: Clear any user-specific cart data if stored separately
        // localStorage.removeItem(`cart_${userId}`);
    }
};

export const audit = {
    trail: async (query: string, action: object, table: string, userId: string) => {
        try {
            await api.put('/audit', { query, action, table, userId });
            return { error: null };
        } catch (err: any) {
            return { error: err };
        }
    }
}