import { getVoterHash, jsonResponse } from '../_utils.js';

/**
 * GET /api/necesidades
 * Devuelve todas las necesidades visibles sin revelar el email,
 * e incluye el indicador booleano `userVoted` para el votante actual.
 */
export async function onRequestGet({ request, env }) {
  try {
    const voterHash = await getVoterHash(request, env);

    // Consulta con LEFT JOIN para saber si el usuario actual ya votó por cada necesidad.
    // NUNCA seleccionamos la columna email por privacidad y seguridad.
    const query = `
      SELECT 
        n.id,
        n.necesidad,
        n.molestia,
        n.votos,
        n.estado,
        n.created_at AS createdAt,
        CASE WHEN v.voter_hash IS NOT NULL THEN 1 ELSE 0 END AS userVoted
      FROM necesidades n
      LEFT JOIN votos_log v ON n.id = v.necesidad_id AND v.voter_hash = ?
      WHERE n.visible = 1
      ORDER BY n.created_at DESC
    `;

    const { results } = await env.DB.prepare(query).bind(voterHash).all();

    const data = (results || []).map(row => ({
      id: row.id,
      necesidad: row.necesidad,
      molestia: row.molestia,
      votos: Number(row.votos),
      estado: row.estado,
      createdAt: Number(row.createdAt),
      userVoted: Boolean(row.userVoted),
    }));

    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: 'Error al consultar necesidades: ' + error.message }, 500);
  }
}

/**
 * POST /api/necesidades
 * Registra una nueva necesidad, valida sus campos, inserta en D1 y
 * registra el voto inicial del autor en votos_log.
 */
export async function onRequestPost({ request, env }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Formato de solicitud inválido. Se espera JSON.' }, 400);
    }

    const necesidad = typeof body.necesidad === 'string' ? body.necesidad.trim() : '';
    const molestia = typeof body.molestia === 'string' && body.molestia.trim() ? body.molestia.trim() : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';

    // Verificación de Cloudflare Turnstile
    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return jsonResponse({ error: 'Verificación de seguridad requerida.' }, 400);
      }

      try {
        const verifyFormData = new FormData();
        verifyFormData.append('secret', env.TURNSTILE_SECRET_KEY);
        verifyFormData.append('response', turnstileToken);
        const clientIp = request.headers.get('CF-Connecting-IP');
        if (clientIp) {
          verifyFormData.append('remoteip', clientIp);
        }

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: verifyFormData,
        });

        const outcome = await verifyRes.json();
        if (!outcome.success) {
          return jsonResponse({ error: 'No se pudo validar que eres humano. Intenta de nuevo.' }, 403);
        }
      } catch (verifyErr) {
        return jsonResponse({ error: 'Error al verificar seguridad: ' + verifyErr.message }, 500);
      }
    } else {
      console.warn('TURNSTILE_SECRET_KEY no está configurada. Omitiendo validación Turnstile en entorno local.');
    }

    // Validación de necesidad (entre 10 y 600 caracteres)
    if (!necesidad || necesidad.length < 10 || necesidad.length > 600) {
      return jsonResponse({
        error: 'La necesidad es requerida y debe contener entre 10 y 600 caracteres.',
      }, 400);
    }

    // Validación de molestia (opcional, máx 400 caracteres)
    if (molestia && molestia.length > 400) {
      return jsonResponse({
        error: 'La molestia actual no debe superar los 400 caracteres.',
      }, 400);
    }

    // Validación de email (opcional, validación de formato básica)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 150) {
        return jsonResponse({
          error: 'El correo electrónico proporcionado no es válido.',
        }, 400);
      }
    }

    const voterHash = await getVoterHash(request, env);
    const id = crypto.randomUUID();
    const now = Date.now();
    const estado = 'En evaluación';
    const votos = 1;
    const visible = 1;

    // Inserción atómica en D1: necesidad + voto inicial en votos_log
    const stmtInsertNecesidad = env.DB.prepare(
      `INSERT INTO necesidades (id, necesidad, molestia, email, votos, estado, visible, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, necesidad, molestia, email, votos, estado, visible, now);

    const stmtInsertVoto = env.DB.prepare(
      `INSERT INTO votos_log (necesidad_id, voter_hash, created_at)
       VALUES (?, ?, ?)`
    ).bind(id, voterHash, now);

    await env.DB.batch([stmtInsertNecesidad, stmtInsertVoto]);

    // Devolvemos el nuevo objeto SIN email
    const nuevoItem = {
      id,
      necesidad,
      molestia,
      votos,
      estado,
      createdAt: now,
      userVoted: true,
    };

    return jsonResponse(nuevoItem, 201);
  } catch (error) {
    return jsonResponse({ error: 'Error al registrar necesidad: ' + error.message }, 500);
  }
}

