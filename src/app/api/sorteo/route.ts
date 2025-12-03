import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Asegúrate de tener este archivo creado como vimos antes
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. SEGURIDAD
    const secret = request.headers.get("x-admin-secret");
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. OBTENER PARTICIPANTES
    const { data: participants, error } = await supabaseAdmin
      .from("profiles")
      .select("*, wishes(description)");

    if (error || !participants || participants.length < 2) {
      return NextResponse.json(
        { error: "Faltan participantes para el sorteo" },
        { status: 400 }
      );
    }

    // 3. ALGORITMO (Derangement - Nadie se regala a sí mismo)
    let givers = [...participants];
    let receivers = [...participants];
    let isValid = false;

    // Intentamos mezclar hasta que nadie coincida consigo mismo
    while (!isValid) {
      receivers = receivers.sort(() => Math.random() - 0.5);
      isValid = !givers.some(
        (giver, index) => giver.id === receivers[index].id
      );
    }

    // 4. PREPARAR DATOS (Sin guardar todavía)
    const matchesToInsert = [];
    const emailPromises = []; // Aquí guardaremos las "promesas" de envío

    for (let i = 0; i < givers.length; i++) {
      const santa = givers[i];
      const recipient = receivers[i];

      // A. Preparamos el insert para la BD
      matchesToInsert.push({
        santa_id: santa.id,
        recipient_id: recipient.id,
      });

      // B. Preparamos el HTML del correo
      const wishListHTML =
        recipient.wishes && recipient.wishes.length > 0
          ? recipient.wishes
              .map((w: any) => `<li>${w.description}</li>`)
              .join("")
          : "<li>¡Sorpréndeme! (No puso deseos)</li>";

      // C. Agregamos el envío a la cola (NO usamos await aquí para que sea rápido)
      const emailTask = resend.emails.send({
        from: "Amigo Secreto <onboarding@resend.dev>", // ⚠️ Si no tienes dominio, usa este. Si tienes, pon el tuyo.
        to: santa.email, // ⚠️ En modo prueba de Resend, solo le llega a tu email registrado. En PROD llega a todos.
        subject: `🎅 RaaS: ¡Te tocó regalar a ${recipient.full_name}!`,
        html: `
          <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #6A1B9A;">🎄 Misión: Regalos as a Service</h1>
            <p>Hola <strong>${santa.full_name}</strong>,</p>
            <p>El algoritmo ha hablado. Tu misión, si decides aceptarla, es regalar a:</p>
            
            <div style="background: #F3E5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4A148C; margin: 0;">🎁 ${recipient.full_name}</h2>
              <p style="margin-top: 5px;">Sede: <strong>${recipient.sede}</strong></p>
            </div>

            <p><strong>Sus deseos son:</strong></p>
            <ul>
              ${wishListHTML}
            </ul>
            
            <hr style="border-top: 1px solid #eee;">
            <p>📅 <strong>Entrega:</strong> Martes 23 de Diciembre</p>
            <p>💰 <strong>Presupuesto:</strong> $10.00 USD</p>
            <p style="font-size: 12px; color: #888;">Powered by Xtrim RaaS</p>
          </div>
        `,
      });

      emailPromises.push(emailTask);
    }

    // 5. EJECUCIÓN PARALELA (Aquí ocurre la magia) 🚀

    // Guardamos todos los matches en BD de una sola vez
    const { error: matchError } = await supabaseAdmin
      .from("matches")
      .insert(matchesToInsert);

    if (matchError) throw matchError;

    // Enviamos TODOS los correos al mismo tiempo
    await Promise.all(emailPromises);

    // 6. RESPONDER
    return NextResponse.json({
      success: true,
      count: matchesToInsert.length,
      matches: matchesToInsert.map((m, i) => ({
        santa: givers[i].full_name,
        recipient: receivers[i].full_name,
        emailStatus: "Sent",
      })),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
