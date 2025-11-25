import Image from "next/image";
import { getPlayerHeadshot } from "@/lib/playerPhoto";

export default function PlayerPhoto({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  return (
    <Image
      src={getPlayerHeadshot(name)}
      alt={name}
      width={size}
      height={size}
      className="rounded-full bg-slate-800"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          "/default/player.png";
      }}
    />
  );
}
