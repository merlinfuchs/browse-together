import { useEffect, useRef } from "react";
import { useFrameState } from "../state/frame";
import { emitEvent } from "../common/socket";
import { useUserState } from "../state/users";
import { useShallow } from "zustand/react/shallow";
import BrowserCursor from "./BrowserCursor";

export default function BrowserPage() {
  const currentFrame = useFrameState((state) => state.currentFrame);
  const cursors = useUserState(useShallow((state) => state.cursors));

  const imgRef = useRef<HTMLImageElement>(null);

  const cursor = useRef<{
    x: number;
    y: number;
    focused: boolean;
    changed: boolean;
  }>({
    x: 0,
    y: 0,
    focused: false,
    changed: false,
  });

  function calculateRelativePosition(e: MouseEvent) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    return { x, y };
  }

  function calculateAbsolutePosition(x: number, y: number) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const xAbs = x * rect.width + rect.left;
    const yAbs = y * rect.height + rect.top;

    return { x: xAbs, y: yAbs };
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const pos = calculateRelativePosition(e);

      cursor.current.x = pos.x;
      cursor.current.y = pos.y;
      cursor.current.changed = true;
    }

    function onMouseOut(e: MouseEvent) {
      if (e.relatedTarget === null) {
        cursor.current.focused = false;
        cursor.current.changed = true;
      }
    }

    function onMouseOver() {
      cursor.current.focused = true;
      cursor.current.changed = true;
    }

    function onClick(e: MouseEvent) {
      if (e.target !== imgRef.current) return;

      const pos = calculateRelativePosition(e);

      emitEvent({
        type: "cursor_click",
        x: pos.x,
        y: pos.y,
        button: "left",
      });
    }

    function onContextMenu(e: MouseEvent) {
      if (e.target !== imgRef.current) return;

      e.preventDefault();

      const pos = calculateRelativePosition(e);

      emitEvent({
        type: "cursor_click",
        x: pos.x,
        y: pos.y,
        button: "right",
      });
    }

    function onScroll(e: WheelEvent) {
      if (e.target !== imgRef.current) return;

      emitEvent({
        type: "scroll_update",
        delta_x: e.deltaX,
        delta_y: e.deltaY,
      });
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.target !== document.body) return;

      emitEvent({
        type: "key_down",
        key: e.key,
      });
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.target !== document.body) return;

      emitEvent({
        type: "key_up",
        key: e.key,
      });
    }

    const interval = setInterval(() => {
      if (cursor.current.changed) {
        emitEvent({
          type: "cursor_move",
          position: {
            x: cursor.current.x,
            y: cursor.current.y,
            frame_focused: cursor.current.focused,
          },
        });
        cursor.current.changed = false;
      }
    }, 100);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("click", onClick);
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("wheel", onScroll);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("click", onClick);
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      clearInterval(interval);
    };
  }, []);

  if (!currentFrame) return null;

  return (
    <div>
      {Object.entries(cursors)
        .filter(([, c]) => c.frame_focused)
        .map(([id, c]) => {
          const pos = calculateAbsolutePosition(c.x, c.y);

          return <BrowserCursor id={id} x={pos.x} y={pos.y} />;
        })}
      <img
        src={currentFrame}
        ref={imgRef}
        alt="Browser Page"
        className="w-full"
      />
    </div>
  );
}
