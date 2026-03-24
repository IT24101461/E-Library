import { useEffect, useState } from "react";

export default function GlowCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: position.x - 10,
        top: position.y - 10,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "rgba(0, 229, 255, 0.25)",
        boxShadow: "0 0 20px rgba(0, 229, 255, 0.35)",
        pointerEvents: "none",
        zIndex: 9999,
        transition: "left 0.05s linear, top 0.05s linear",
      }}
    />
  );
}