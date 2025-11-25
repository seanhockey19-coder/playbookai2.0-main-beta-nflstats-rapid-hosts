"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface FavoriteItem {
  id: string;
  type: "player" | "prop" | "game";
  label: string; // Player name / Game name / Prop label
  extra?: any;   // Optional: player photo, team logos, etc.
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // Save favorites when updated
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(item: FavoriteItem) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      if (exists) {
        return prev.filter((f) => f.id !== item.id);
      }
      return [...prev, item];
    });
  }

  function isFavorite(id: string) {
    return favorites.some((f) => f.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
