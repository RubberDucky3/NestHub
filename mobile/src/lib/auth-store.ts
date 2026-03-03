import * as SecureStore from "expo-secure-store";
import { setToken } from "./api-client";

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

let currentUser: User | null = null;
const listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeAuth(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getUser(): User | null {
  return currentUser;
}

export async function saveAuth(token: string, user: User) {
  await SecureStore.setItemAsync("authToken", token);
  await SecureStore.setItemAsync("authUser", JSON.stringify(user));
  setToken(token);
  currentUser = user;
  notify();
}

export async function loadAuth(): Promise<boolean> {
  const token = await SecureStore.getItemAsync("authToken");
  const userStr = await SecureStore.getItemAsync("authUser");
  if (token && userStr) {
    setToken(token);
    currentUser = JSON.parse(userStr);
    notify();
    return true;
  }
  return false;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync("authToken");
  await SecureStore.deleteItemAsync("authUser");
  setToken(null);
  currentUser = null;
  notify();
}
