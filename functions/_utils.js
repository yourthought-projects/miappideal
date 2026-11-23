/**
 * Utilidades para Cloudflare Pages Functions
 */

/**
 * Genera un hash seguro y anónimo del votante a partir de su IP y un salt del entorno.
 * @param {Request} request
 * @param {Record<string, any>} env
 * @returns {Promise<string>} Hash SHA-256 en formato hexadecimal
 */
export async function getVoterHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local-dev';
  const salt = env?.VOTE_SALT || 'miappideal-vote-salt-dev-2024';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper para respuestas JSON estandarizadas
 * @param {any} data
 * @param {number} status
 * @param {Record<string, string>} headers
 * @returns {Response}
 */
export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      ...headers,
    },
  });
}

