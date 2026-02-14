/* ── DigestiGo AI Engine — Grok API ───────────────────────────── */
/* Exposes generateResponse(text) → Promise<{text, card}>         */

console.log('📍 ai-engine.js: loading');

const GROK_API_KEY  = 'gsk_gZooPP2JtVirKe5xfGKe5xfGTmWGdyb3FYzidGDPBq8YdwyiYV5JRRaGnVY';
const GROK_BASE_URL = 'https://api.x.ai/v1';
const GROK_MODEL    = 'grok-3-mini';

const SYSTEM_PROMPT = `You are DigestiBot, an AI gut health assistant inside the DigestiGo app.
Your job is to help users track their diet, physical activity, digestive symptoms, and energy levels through natural conversation.

When a user tells you about food, activity, symptoms, or energy, respond helpfully with gut-health insights AND output a JSON log card at the END of your response.

Always end your response with a JSON block in this exact format (no markdown fences, just raw JSON on its own line):
LOG_CARD:{"type":"food|activity|symptom|energy","title":"emoji Title","data":{"Key":"Value",...}}

Rules:
- type must be one of: food, activity, symptom, energy
- For food: include Item(s), Est. Calories, Fiber, Portion
- For activity: include Activity, Duration, Gut Benefit
- For symptom: include Symptom, Severity, Tip
- For energy: include Level, Score, Linked to
- If the message is a greeting or question (no tracking to log), omit the LOG_CARD line entirely.
- Keep responses concise (2-4 sentences) and focused on digestive health.
- Use **bold** for emphasis on key terms.`;

const conversationHistory = [];

async function generateResponse(text) {
  conversationHistory.push({ role: 'user', content: text });

  let rawText;
  try {
    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${res.status}: ${err}`);
    }

    const data = await res.json();
    rawText = data.choices[0].message.content.trim();
  } catch (e) {
    console.error('Grok API error:', e);
    rawText = "I'm having trouble connecting right now. Please try again in a moment.";
  }

  conversationHistory.push({ role: 'assistant', content: rawText });

  // Parse optional LOG_CARD from response
  const cardMatch = rawText.match(/LOG_CARD:(\{.+\})/);
  let card = null;
  let displayText = rawText;

  if (cardMatch) {
    try {
      card = JSON.parse(cardMatch[1]);
    } catch (_) { /* ignore malformed card */ }
    displayText = rawText.replace(/LOG_CARD:\{.+\}/, '').trim();
  }

  return { text: displayText, card };
}
