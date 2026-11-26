/**
 * PinkPrint AI backend — Cloudflare Worker
 * Deploy this as a private, authenticated proxy to the OpenAI API.
 * Required Worker secrets: OPENAI_API_KEY and PINKPRINT_ACCESS_TOKEN.
 * Optional variable: OPENAI_MODEL (defaults to gpt-4.1-mini).
 */
const SYSTEM_PROMPT = `You are PinkPrint AI, a warm, grounded personal-growth and creative companion inside the PinkPrint app. Help the user reflect, explore their authentic preferences and values, plan realistic next steps, journal, and create. Do not decide who the user should become. Be compassionate and honest, distinguish facts from assumptions when relevant, and encourage agency rather than dependence. You are not a therapist, doctor, lawyer, or emergency service. Do not diagnose. For medical, legal, or safety-critical matters, provide careful general information and encourage qualified help. Keep answers practical and conversational.`;

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const json = (body, status = 200) => new Response(JSON.stringify(body), {
      status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
    if (new URL(request.url).pathname !== '/chat') return json({ error: 'Not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!env.OPENAI_API_KEY || !env.PINKPRINT_ACCESS_TOKEN) return json({ error: 'AI backend is not configured.' }, 503);
    const auth = request.headers.get('Authorization') || '';
    if (auth !== 'Bearer ' + env.PINKPRINT_ACCESS_TOKEN) return json({ error: 'Unauthorized. Check your PinkPrint access token.' }, 401);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) return json({ error: 'Send between 1 and 20 messages.' }, 400);
    const messages = [];
    for (const item of body.messages) {
      if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim() || item.content.length > 3000) {
        return json({ error: 'Invalid message. Each message must be text up to 3,000 characters.' }, 400);
      }
      messages.push({ role: item.role, content: item.content });
    }
    try {
      const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4.1-mini',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 700,
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) return json({ error: 'The AI provider could not complete the request. Check backend logs and provider billing/settings.' }, 502);
      const reply = data.choices?.[0]?.message?.content;
      if (typeof reply !== 'string' || !reply.trim()) return json({ error: 'The AI provider returned no text.' }, 502);
      return json({ reply: reply.trim() });
    } catch {
      return json({ error: 'Could not connect to the AI provider.' }, 502);
    }
  },
};