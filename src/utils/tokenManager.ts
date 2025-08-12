// Token manager để lấy access token từ Redux store
import { store } from "@/store";

export const getAccessTokenFromStore = (): string | null => {
  const state = store.getState();
  return state.auth.accessToken;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};
