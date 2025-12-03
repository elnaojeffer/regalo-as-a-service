import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. SEGURIDAD 🔒
    const secret = request.headers.get("x-admin-secret");
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- CONFIGURACIÓN DE FECHA (Desde BD) ---
    const { data: configData } = await supabaseAdmin
      .from("config")
      .select("value")
      .eq("key", "fecha_intercambio")
      .single();

    const rawDate = configData?.value || new Date().toISOString();

    // Formato bonito (Ej: "Martes, 23 de Diciembre")
    const fechaBonita = new Date(rawDate).toLocaleDateString("es-EC", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Guayaquil",
    });
    const FECHA_FINAL =
      fechaBonita.charAt(0).toUpperCase() + fechaBonita.slice(1);
    // -----------------------------------------

    // 2. LIMPIEZA TABLA 🧹
    await supabaseAdmin.from("matches").delete().neq("id", 0);

    // 3. OBTENER PARTICIPANTES 👥
    const { data: participants, error } = await supabaseAdmin
      .from("profiles")
      .select("*, wishes(description)");

    if (error || !participants || participants.length < 2) {
      return NextResponse.json(
        { error: "Faltan participantes." },
        { status: 400 }
      );
    }

    // 4. ALGORITMO CIRCULAR 🔄
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 5. PREPARAR DATOS (Sin enviar todavía) 📦
    const matchesToInsert = [];
    const emailPayloads: any[] = []; // Aquí acumulamos los correos

    for (let i = 0; i < shuffled.length; i++) {
      const santa = shuffled[i];
      const recipient = shuffled[(i + 1) % shuffled.length];

      // A. Datos para BD
      matchesToInsert.push({
        santa_id: santa.id,
        recipient_id: recipient.id,
      });

      // B. Datos para el Email (HTML)
      const wishListHTML =
        recipient.wishes && recipient.wishes.length > 0
          ? recipient.wishes
              .map(
                (w: any) =>
                  `<li style="margin-bottom:5px;">${w.description}</li>`
              )
              .join("")
          : "<li>¡Sorpréndeme! (Sin deseos)</li>";

      // C. Agregamos a la lista de envíos (Payload Batch)
      emailPayloads.push({
        from: "RaaS - Amigo Secreto <santa@raas-xtr.online>",
        to: santa.email,
        subject: `🎅 RaaS: Misión para regalar a ${recipient.full_name}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4A148C; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">🎄 Asignación RaaS</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hola <strong>${santa.full_name}</strong>,</p>
              <p>Tu misión secreta ha sido generada:</p>
              
              <div style="background: #F3E5F5; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <span style="font-size: 12px; color: #6A1B9A; font-weight: bold;">DESTINATARIO:</span>
                <h2 style="margin: 5px 0; color: #4A148C;">🎁 ${recipient.full_name}</h2>
                <small>Sede: ${recipient.sede}</small>
              </div>

              <h3>📜 Sus Deseos:</h3>
              <ul>${wishListHTML}</ul>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
              
              <div style="font-size: 14px; color: #555;">
                <p>📅 <strong>Fecha de Entrega:</strong> ${FECHA_FINAL}</p>
                <p>💰 <strong>Presupuesto:</strong> $10.00 USD</p>
              </div>
            </div>
             <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              Powered by Xtrim Dev Team
            </div>
          </div>
        `,
      });
    }

    // 6. EJECUCIÓN OPTIMIZADA (BULK / LOTES) 🚀

    // A. Guardar en BD (Bulk Insert - 1 sola llamada)
    const { error: matchError } = await supabaseAdmin
      .from("matches")
      .insert(matchesToInsert);

    if (matchError) throw matchError;

    // B. Enviar Correos en Lotes (Batch Sending)
    // Resend permite máximo 100 correos por petición batch.
    const BATCH_SIZE = 100;

    // Si tienes 150 usuarios, esto hará 2 llamadas (una de 100 y otra de 50)
    for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
      const chunk = emailPayloads.slice(i, i + BATCH_SIZE);

      const { error: batchError } = await resend.batch.send(chunk);

      if (batchError) {
        console.error("❌ Error enviando lote:", batchError);
        // Opcional: Podrías lanzar error aquí, pero mejor dejar que siga con el siguiente lote
      } else {
        console.log(`✅ Lote enviado: ${chunk.length} correos.`);
      }
    }

    return NextResponse.json({ success: true, count: matchesToInsert.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
