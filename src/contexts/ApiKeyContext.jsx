import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ApiKeyContext = createContext(null);

const STORAGE_KEY = 'dify_api_key';

function getStoredKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function getEnvKey() {
  // Vite injects import.meta.env at build time
  try {
    return import.meta.env.VITE_DIFY_API_KEY || '';
  } catch {
    return '';
  }
}

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => getEnvKey() || getStoredKey());
  const [showModal, setShowModal] = useState(false);

  // Modal opens only when user clicks 🔑 — no longer required on mount.
  // In production, the server proxy handles API calls without a user key.

  const setApiKey = useCallback((key) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    if (trimmed) {
      try {
        localStorage.setItem(STORAGE_KEY, trimmed);
      } catch { /* storage full, ignore */ }
    }
    setShowModal(false);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setShowModal(true);
  }, []);

  const openSettings = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey, openSettings, showModal, setShowModal }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider');
  return ctx;
}
