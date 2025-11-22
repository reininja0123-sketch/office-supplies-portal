// // Since we set up the Vite proxy in vite.config.ts, we can use relative paths
// const BASE_URL = "/api";
//
// export const api = {
//     get: async (endpoint: string) => {
//         const res = await fetch(`${BASE_URL}${endpoint}`);
//         if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
//         return res.json();
//     },
//
//     post: async (endpoint: string, data: any) => {
//         const res = await fetch(`${BASE_URL}${endpoint}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data),
//         });
//         if (!res.ok) {
//             const err = await res.json();
//             throw new Error(err.error || `API Error: ${res.statusText}`);
//         }
//         return res.json();
//     },
//
//     put: async (endpoint: string, data: any) => {
//         const res = await fetch(`${BASE_URL}${endpoint}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data),
//         });
//         if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
//         return res.json();
//     },
//
//     delete: async (endpoint: string) => {
//         const res = await fetch(`${BASE_URL}${endpoint}`, {
//             method: "DELETE",
//         });
//         if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
//         return res.json();
//     },
// };
//
// // Simple mock auth helper (since we haven't built full JWT auth in backend yet)
// export const auth = {
//     getUser: () => {
//         const user = localStorage.getItem("user_session");
//         return user ? JSON.parse(user) : null;
//     },
//     signIn: async (email: string) => {
//         // In a real app, this hits /api/login and gets a JWT
//         const mockUser = { id: "user_123", email, role: email.includes("admin") ? "admin" : "user" };
//         localStorage.setItem("user_session", JSON.stringify(mockUser));
//         return { user: mockUser, error: null };
//     },
//     signOut: async () => {
//         localStorage.removeItem("user_session");
//     }
// };


// src/lib/api.ts

// The Vite proxy configured in vite.config.ts forwards '/api' to 'http://localhost:3000'
const BASE_URL = "/api";

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
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

    post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: "POST", data }),

    put: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: "PUT", data }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

// ============================================================================
// Mock Authentication Helper
// ============================================================================
// Since we removed Supabase Auth, we use LocalStorage to simulate a session.

const STORAGE_KEY = "procurement_user_session";

export interface UserSession {
    id: string;
    email: string;
    full_name?: string;
    role: "admin" | "user";
}

export const auth = {
    /**
     * Get the current logged-in user from local storage
     */
    getUser: (): UserSession | null => {
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) return null;
        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    },

    /**
     * test admin@local.com
     * Simulate a sign-in.
     * Logic: If email contains 'admin', grant admin role. Otherwise, user role.
     */
    signIn: async (email: string) => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const isAdmin = email.toLowerCase().includes("admin");

        const mockUser: UserSession = {
            id: crypto.randomUUID(), // Generate a fake User ID
            email,
            role: isAdmin ? "admin" : "user",
            full_name: email.split("@")[0], // Mock name based on email
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        return { user: mockUser, error: null };
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