"use client";

// Último recurso: aparece quando o próprio layout da raiz quebra (por isso tem html e body).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "sans-serif",
          background: "#0b1220",
          color: "#e5e7eb",
        }}
      >
        <h1 style={{ fontSize: 20 }}>Algo deu errado</h1>
        <button
          onClick={reset}
          style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
