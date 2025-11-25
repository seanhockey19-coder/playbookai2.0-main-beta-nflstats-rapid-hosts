import "./globals.css";
import { FavoritesProvider } from "@/context/FavoritesContext";

export const metadata = {
  title: "CoachesPlaybookAI",
  description: "Sports analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <FavoritesProvider>
          {/* Root layout should have NO sidebar */}
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}
