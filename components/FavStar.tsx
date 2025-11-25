"use client";

import { useFavorites } from "@/context/FavoritesContext";

export default function FavStar({
  item,
  size = 18,
}: {
  item: {
    id: string;
    type: "player" | "prop" | "game";
    label: string;
    extra?: any;
  };
  size?: number;
}) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(item.id);

  return (
    <button
      onClick={() => toggleFavorite(item)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      {fav ? (
        // Filled star
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="#facc15"
        >
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.516 8.283L12 18.896l-7.452 4.521 1.516-8.283L0 9.306l8.332-1.151z" />
        </svg>
      ) : (
        // Hollow star
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          stroke="#facc15"
          fill="none"
          strokeWidth="2"
        >
          <path d="M12 2l2.9 6h6.6l-5.3 4.1 2 6-5.2-4-5.2 4 2-6L2.5 8h6.6L12 2z" />
        </svg>
      )}
    </button>
  );
}
