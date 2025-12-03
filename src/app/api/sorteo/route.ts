import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. SEGURIDAD
    const secret = request.headers.get('x-admin-secret');
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. LIMPIEZA (Evitar duplicados)
    const { error: deleteError } = await supabaseAdmin
      .from('matches')
      .delete()
      .neq('id', 0); 
    
    if (deleteError) console.error("Error limpiando tabla:", deleteError);

    // 3. OBTENER PARTICIPANTES
    const { data: participants, error } = await supabaseAdmin
      .from('profiles')
      .select('*, wishes(description)');

    if (error || !participants || participants.length < 2) {
      return NextResponse.json({ error: 'Faltan participantes' }, { status: 400 });
    }

    // 4. ALGORITMO (Derangement)
    let givers = [...participants];
    let receivers = [...participants];
    let isValid = false;
    
    while (!isValid) {
      receivers = receivers.sort(() => Math.random() - 0.5);
      isValid = !givers.some((giver, index) => giver.id === receivers[index].id);
    }

    // 5. PREPARAR DATOS (Arrays para Batch)
    const matchesToInsert = [];
    const emailsBatch = []; // <--- AQUÍ GUARDAMOS LOS CORREOS PARA ENVIARLOS JUNTOS

    for (let i = 0; i < givers.length; i++) {
      const santa = givers[i];
      const recipient = receivers[i];

      // A. Datos para BD
      matchesToInsert.push({
        santa_id: santa.id,
        recipient_id: recipient.id
      });

      // B. HTML del Correo
      const wishListHTML = recipient.wishes && recipient.wishes.length > 0
        ? recipient.wishes.map((w: any) => `<li>${w.description}</li>`).join('')
        : '<li>¡Sorpréndeme! (No puso deseos)</li>';

      // C. Objeto de Correo (Lo guardamos en el array, NO lo enviamos todavía)
      emailsBatch.push({
        from: 'RaaS - Amigo Secreto <santa@raas-xtr.online>', // Tu dominio verificado
        to: santa.email, // Destinatario real
        subject: `🎅 RaaS: ¡Te tocó regalar a ${recipient.full_name}!`,
        html: `
          <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #6A1B9A;">🎄 Misión: Regalos as a Service</h1>
            <p>Hola <strong>${santa.full_name}</strong>,</p>
            <p>El algoritmo ha hablado. Tu misión es regalar a:</p>
            
            <div style="background: #F3E5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4A148C; margin: 0;">🎁 ${recipient.full_name}</h2>
              <p style="margin-top: 5px;">Sede: <strong>${recipient.sede}</strong></p>
            </div>

            <p><strong>Sus deseos son:</strong></p>
            <ul>${wishListHTML}</ul>
            
            <hr style="border-top: 1px solid #eee;">
            <p>📅 <strong>Entrega:</strong> Martes 23 de Diciembre</p>
            <p>💰 <strong>Presupuesto:</strong> $10.00 USD</p>
          </div>
        `
      });
    }

    // 6. EJECUCIÓN (BD + EMAIL BATCH)
    
    // Insertar Matches en BD
    const { error: matchError } = await supabaseAdmin
      .from('matches')
      .insert(matchesToInsert);

    if (matchError) throw matchError;

    // --- CORRECCIÓN CLAVE: ENVIAR POR LOTES (BATCH) ---
    // Resend permite mandar hasta 100 correos en 1 sola petición.
    // Esto cuenta como "1 request", así que no viola el límite de velocidad.
    const { data: emailData, error: emailError } = await resend.batch.send(emailsBatch);

    if (emailError) {
      console.error("❌ Error enviando batch de correos:", emailError);
      // Ojo: Si falla el correo, los matches YA se guardaron en BD.
      return NextResponse.json({ success: true, warning: "Matches creados pero fallaron correos", error: emailError });
    }

    return NextResponse.json({ 
      success: true, 
      count: matchesToInsert.length,
      message: "Sorteo ejecutado y correos enviados por batch"
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}