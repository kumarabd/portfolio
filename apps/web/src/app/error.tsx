"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--space-2xl)",
        gap: "var(--space-lg)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
        Something went wrong loading MeSpace
      </h1>
      <button
        onClick={() => reset()}
        style={{
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
