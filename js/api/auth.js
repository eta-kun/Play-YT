import { CONFIG, STORAGE_KEYS } from "../utils/constants.js";
import { safeSessionGet, safeSessionRemove, safeSessionSet } from "../storage/settings.js";

let tokenClient;
let tokenState = safeSessionGet(STORAGE_KEYS.auth);
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(getAuthState()));
}

function isConfigured() {
  return !CONFIG.GOOGLE_CLIENT_ID.startsWith("YOUR_");
}

function expiresAt(expiresIn) {
  return Date.now() + Number(expiresIn || 0) * 1000;
}

export function getAuthState() {
  const isExpired = !tokenState?.accessToken || Date.now() > tokenState.expiresAt - CONFIG.TOKEN_SKEW_MS;
  return {
    isConfigured: isConfigured(),
    isSignedIn: Boolean(tokenState?.accessToken && !isExpired),
    token: isExpired ? null : tokenState?.accessToken,
    profile: tokenState?.profile || null
  };
}

export function onAuthChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function initAuth() {
  if (!isConfigured()) return getAuthState();
  await waitForGoogleIdentity();
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: async (response) => {
      if (response.error) throw new Error(response.error);
      tokenState = {
        accessToken: response.access_token,
        expiresAt: expiresAt(response.expires_in),
        profile: await fetchProfile(response.access_token)
      };
      safeSessionSet(STORAGE_KEYS.auth, tokenState);
      notify();
    }
  });
  notify();
  return getAuthState();
}

export function signIn({ prompt = "consent" } = {}) {
  if (!tokenClient) throw new Error("Google Identity Services is not ready.");
  tokenClient.requestAccessToken({ prompt });
}

export function signOut() {
  if (tokenState?.accessToken && window.google?.accounts?.oauth2) {
    google.accounts.oauth2.revoke(tokenState.accessToken, () => {});
  }
  tokenState = null;
  safeSessionRemove(STORAGE_KEYS.auth);
  notify();
}

export async function getAccessToken() {
  const state = getAuthState();
  if (state.token) return state.token;
  if (!tokenClient) throw new Error("Sign in before using YouTube data.");
  tokenClient.requestAccessToken({ prompt: "" });
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Google sign in timed out.")), 15000);
    const off = onAuthChange((next) => {
      if (next.token) {
        clearTimeout(timeout);
        off();
        resolve(next.token);
      }
    });
  });
}

async function fetchProfile(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) return null;
  return response.json();
}

function waitForGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - started > 10000) {
        clearInterval(timer);
        reject(new Error("Google Identity Services failed to load."));
      }
    }, 100);
  });
}
