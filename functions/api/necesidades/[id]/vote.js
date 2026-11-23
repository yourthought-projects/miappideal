import { getVoterHash, jsonResponse } from '../../../_utils.js';

/**
 * POST /api/necesidades/:id/vote
 * Alterna el voto (toggle) del usuario identificado por `voter_hash`.
 * Si ya votó, elimina el registro y resta 1 voto (mínimo 0).
 * Si no ha votado, crea el registro y suma 1 voto.
 */
export async function onRequestPost({ request, env, params }) {
  try {
    const id = params.id;
    if (!id) {
      return jsonResponse({ error: 'ID de necesidad no especificado.' }, 400);
    }

    // Verificar que la necesidad exista y esté visible
    const necesidadRow = await env.DB.prepare(
      'SELECT id, votos, visible FROM necesidades WHERE id = ?'
    ).bind(id).first();

    if (!necesidadRow) {
      return jsonResponse({ error: 'Necesidad no encontrada.' }, 404);
    }

    const voterHash = await getVoterHash(request, env);

    // Comprobar si ya existe un voto registrado para este voter_hash
    const existingVote = await env.DB.prepare(
      'SELECT 1 FROM votos_log WHERE necesidad_id = ? AND voter_hash = ?'
    ).bind(id, voterHash).first();

    let userVoted = false;
    const now = Date.now();

    if (existingVote) {
      // Retirar voto
      const stmtDeleteVote = env.DB.prepare(
        'DELETE FROM votos_log WHERE necesidad_id = ? AND voter_hash = ?'
      ).bind(id, voterHash);

      const stmtUpdateVotos = env.DB.prepare(
        'UPDATE necesidades SET votos = MAX(0, votos - 1) WHERE id = ?'
      ).bind(id);

      await env.DB.batch([stmtDeleteVote, stmtUpdateVotos]);
      userVoted = false;
    } else {
      // Registrar voto
      const stmtInsertVote = env.DB.prepare(
        'INSERT INTO votos_log (necesidad_id, voter_hash, created_at) VALUES (?, ?, ?)'
      ).bind(id, voterHash, now);

      const stmtUpdateVotos = env.DB.prepare(
        'UPDATE necesidades SET votos = votos + 1 WHERE id = ?'
      ).bind(id);

      await env.DB.batch([stmtInsertVote, stmtUpdateVotos]);
      userVoted = true;
    }

    // Obtener el conteo actualizado de votos
    const updated = await env.DB.prepare(
      'SELECT votos FROM necesidades WHERE id = ?'
    ).bind(id).first();

    return jsonResponse({
      id,
      votos: Number(updated.votos),
      userVoted,
    });
  } catch (error) {
    return jsonResponse({ error: 'Error al procesar voto: ' + error.message }, 500);
  }
}

