import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ConfigFormReturn {
  formDateSorteo: string;
  formDateIntercambio: string;
  formAdminEmail: string;
  savingConfig: boolean;
  setFormDateSorteo: (value: string) => void;
  setFormDateIntercambio: (value: string) => void;
  setFormAdminEmail: (value: string) => void;
  handleSaveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
}

export function useConfigForm(): ConfigFormReturn {
  const [formDateSorteo, setFormDateSorteo] = useState("");
  const [formDateIntercambio, setFormDateIntercambio] = useState("");
  const [formAdminEmail, setFormAdminEmail] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  const loadConfig = async () => {
    const { data: configData } = await supabase.from("config").select("*");
    if (configData) {
      const adminCfg = configData.find((c) => c.key === "admin_email");
      const sorteoCfg = configData.find((c) => c.key === "fecha_sorteo");
      const intercambioCfg = configData.find(
        (c) => c.key === "fecha_intercambio"
      );

      if (adminCfg) setFormAdminEmail(adminCfg.value);
      if (sorteoCfg) setFormDateSorteo(sorteoCfg.value);
      if (intercambioCfg) setFormDateIntercambio(intercambioCfg.value);
    }
  };

  const handleSaveConfig = async () => {
    if (!confirm("¿Actualizar la configuración del sistema?")) return;

    setSavingConfig(true);

    const updates = [
      { key: "admin_email", value: formAdminEmail },
      { key: "fecha_sorteo", value: formDateSorteo },
      { key: "fecha_intercambio", value: formDateIntercambio },
    ];

    const { error } = await supabase.from("config").upsert(updates);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("✅ Configuración actualizada correctamente");
      await loadConfig();
    }

    setSavingConfig(false);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    formDateSorteo,
    formDateIntercambio,
    formAdminEmail,
    savingConfig,
    setFormDateSorteo,
    setFormDateIntercambio,
    setFormAdminEmail,
    handleSaveConfig,
    loadConfig,
  };
}
