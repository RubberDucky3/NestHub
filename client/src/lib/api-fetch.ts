import { getApiUrl } from "./api-config";

export async function fetchApi(path: string, options: RequestInit = {}) {
    const url = path.startsWith("http") ? path : `${getApiUrl()}${path}`;

    const token = localStorage.getItem("auth_token");
    const headers = new Headers(options.headers);

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Important for session cookies on web
    });

    return response;
}
