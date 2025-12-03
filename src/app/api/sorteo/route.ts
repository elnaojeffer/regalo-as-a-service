console.log("Sorteo goes here");
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. SEGURIDAD SIMPLE: Verificar Header de Admin
    // Para ejecutar esto, tendrás que enviar un header 'x-admin-secret'
    const secret = request.headers.get("x-admin-secret");
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. OBTENER PARTICIPANTES Y SUS DESEOS
    // Traemos perfiles y también sus deseos (wishes)
    const { data: participants, error } = await supabaseAdmin
      .from("profiles")
      .select("*, wishes(description)");

    if (error || !participants || participants.length < 2) {
      return NextResponse.json(
        { error: "No hay suficientes participantes" },
        { status: 400 }
      );
    }

    // 3. ALGORITMO DE ASIGNACIÓN (Derangement)
    let givers = [...participants];
    let receivers = [...participants];
    let isValid = false;

    // Intentamos mezclar hasta que nadie se tenga a sí mismo
    // (Para grupos pequeños < 5, esto es instantáneo. Para grandes también).
    while (!isValid) {
      // Shuffle Fisher-Yates simplificado
      receivers = receivers.sort(() => Math.random() - 0.5);

      // Verificar si hay colisiones (Alguien se regala a sí mismo)
      isValid = !givers.some(
        (giver, index) => giver.id === receivers[index].id
      );
    }

    // 4. GUARDAR Y ENVIAR
    const results = [];

    for (let i = 0; i < givers.length; i++) {
      const santa = givers[i];
      const recipient = receivers[i];

      // A. Guardar en Base de Datos (Tabla matches)
      const { error: matchError } = await supabaseAdmin.from("matches").insert({
        santa_id: santa.id,
        recipient_id: recipient.id,
      });

      if (matchError) console.error("Error guardando match:", matchError);

      // B. Preparar lista de deseos del destinatario
      const wishListHTML =
        recipient.wishes && recipient.wishes.length > 0
          ? recipient.wishes
              .map((w: any) => `<li>${w.description}</li>`)
              .join("")
          : "<li>¡Sorpréndeme! (No puso deseos)</li>";

      // C. Enviar Correo con Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "Amigo Secreto <onboarding@resend.dev>", // Usa este remitente si no tienes dominio propio verificado
        to: santa.email, // IMPORTANTE: En pruebas, Resend solo deja enviar a tu propio email registrado.
        subject: `🎅 ¡Hola ${santa.full_name}, te tocó regalar a...!`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>🎄 Tu misión secreta ha comenzado</h1>
            <p>Hola <strong>${santa.full_name}</strong>,</p>
            <p>El sorteo se ha realizado y tu amigo secreto es:</p>
            <h2 style="color: #d32f2f; background: #eee; padding: 10px; display: inline-block;">
              🎁 ${recipient.full_name} (${recipient.sede})
            </h2>
            <p><strong>Sus deseos son:</strong></p>
            <ul>
              ${wishListHTML}
            </ul>
            <hr>
            <p>📅 <strong>Entrega:</strong> Viernes 5 de Diciembre</p>
            <p>💰 <strong>Presupuesto:</strong> $10.00 USD</p>
          </div>
        `,
      });

      results.push({
        santa: santa.full_name,
        recipient: recipient.full_name,
        emailStatus: emailError ? "Failed" : "Sent",
      });
    }

    return NextResponse.json({ success: true, matches: results });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
