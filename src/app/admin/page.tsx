'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Cliente público (para auth check)

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleRunSorteo = async () => {
    if(!confirm("⚠️ ¿ESTÁS SEGURO? Esto enviará los correos a todos.")) return;
    
    setLoading(true);
    setLogs([]);

    try {
      // Llamamos a nuestra propia API
      const response = await fetch('/api/sorteo', {
        method: 'POST',
        headers: {
          // OJO: Aquí deberías poner la clave que definimos en el backend
          // PERO como estamos en el cliente, no podemos usar process.env.SERVICE_KEY.
          // Para esta prueba rápida, te recomiendo poner la clave hardcodeada aquí solo para correrlo tú
          // O configurar un input de password en esta pantalla.
          'x-admin-secret': prompt("Ingresa la SERVICE ROLE KEY para autorizar:") || '' 
        }
      });

      const data = await response.json();
      setLogs(data.matches || []);
      
      if(!response.ok) alert("Error: " + (data.error || 'Desconocido'));
      else alert("¡Sorteo realizado con éxito! 🎅");

    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212121] via-[#4A148C] to-[#212121] text-white p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] p-4 rounded-full mb-4">
            <span className="text-5xl">🎅</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Panel de Administración</h1>
          <p className="text-purple-300 text-sm">Sistema de Sorteo Navideño Xtrim</p>
        </div>
      
        <div className="border-2 border-[#8E24AA] p-8 rounded-2xl bg-gradient-to-br from-[#4A148C]/50 to-[#6A1B9A]/30 backdrop-blur-sm shadow-2xl">
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-300 text-sm flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>Ejecuta el sorteo solo cuando todos los participantes hayan completado su registro.</span>
            </p>
          </div>
          
          <button 
            onClick={handleRunSorteo}
            disabled={loading}
            className="bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] hover:from-[#8E24AA] hover:to-[#6A1B9A] disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-5 px-8 rounded-xl text-xl w-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
          >
            {loading ? '✨ EJECUTANDO SORTEO...' : '🎄 EJECUTAR SORTEO Y ENVIAR EMAILS'}
          </button>
        </div>

        {logs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl mb-4 font-bold text-purple-300 flex items-center gap-2">
              📋 Log de Resultados
              <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                {logs.length} asignaciones
              </span>
            </h2>
            <div className="bg-[#212121] border-2 border-[#8E24AA] p-6 rounded-xl h-96 overflow-auto shadow-xl">
              {logs.map((log, i) => (
                <div key={i} className="border-b border-purple-900/50 py-3 hover:bg-purple-900/20 transition-colors px-2 rounded">
                  <span className="text-green-400 font-semibold">🎅 {log.santa}</span> 
                  <span className="text-purple-300"> → regala a → </span>
                  <span className="text-yellow-300 font-semibold">🎁 {log.recipient}</span>
                  <span className="float-right text-xs bg-[#6A1B9A] text-white px-3 py-1 rounded-full">{log.emailStatus}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}