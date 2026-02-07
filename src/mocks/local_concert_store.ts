// src/mocks/local_concert_store.ts
// 공연 생성 테스트용 로컬 스토리지
import type { Concert } from "@/types/concert_detail";

const KEY = "bm_local_concerts_v1";

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const getLocalConcerts = (): Concert[] => {
  if (typeof window === "undefined") return [];
  return safeParse<Concert[]>(localStorage.getItem(KEY), []);
};

export const addLocalConcert = (concert: Concert) => {
  if (typeof window === "undefined") return;
  const prev = getLocalConcerts();
  localStorage.setItem(KEY, JSON.stringify([concert, ...prev]));
};

export const updateLocalConcert = (id: string, patch: Partial<Concert>) => {
  if (typeof window === "undefined") return;
  const prev = getLocalConcerts();
  const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
  localStorage.setItem(KEY, JSON.stringify(next));
};

export const removeLocalConcert = (id: string) => {
  if (typeof window === "undefined") return;
  const prev = getLocalConcerts();
  localStorage.setItem(KEY, JSON.stringify(prev.filter((c) => c.id !== id)));
};