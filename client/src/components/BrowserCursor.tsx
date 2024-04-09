import { useState } from "react";
import clsx from "clsx";
import { useUserState } from "../state/users";

export default function BrowserCursor({
  id,
  x,
  y,
}: {
  id: string;
  x: number;
  y: number;
}) {
  const [clicked, setClicked] = useState(false);

  const color = useUserState((state) => state.users[id]?.color);

  return (
    <div
      className={clsx(
        "h-5 w-5 rounded-full opacity-90",
        clicked && "animate-ping"
      )}
      style={{
        backgroundColor: color,
        position: "fixed",
        left: x,
        top: y,
        transition: "top 0.1s ease, left 0.1s ease",
      }}
    ></div>
  );
}
