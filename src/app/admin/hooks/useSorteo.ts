import { useState } from "react";
import confetti from "canvas-confetti";

interface UseSorteoReturn {
  loading: boolean;
  handleRunSorteo: () => Promise<void>;
}

export function useSorteo(onSuccess?: () => void): UseSorteoReturn {
  const [loading, setLoading] = useState(false);

  const handleRunSorteo = async () => {
    if (!confirm("⚠️ ¿Ejecutar sorteo? Se enviarán correos a todos.")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/sorteo", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido");
      }

      alert(`✅ Sorteo exitoso!\n\n${data.message}`);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });

      // Callback de éxito (para recargar matches)
      if (onSuccess) onSuccess();
    } catch (e: any) {
      alert("❌ Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleRunSorteo,
  };
}
