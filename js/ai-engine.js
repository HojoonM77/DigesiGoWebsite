/* ── DigestiGo AI Engine — Grok API ───────────────────────────── */
/* Exposes generateResponse(text) → Promise<{text, card}>         */

const GROK_API_KEY  = 'gsk_gZooPP2JtVirKe5xfGKe5xfGTmWGdyb3FYzidGDPBq8YdwyiYV5JRRaGnVY';
const GROK_BASE_URL = 'https://api.groq.com/openai/v1';
const GROK_MODEL    = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are DigestiBot, a gut health assistant in the DigestiGo app. Help users track diet, activity, symptoms, and energy through conversation.

When tracking something, end your reply with exactly one LOG_CARD line:
LOG_CARD:{"type":"food","title":"🥦 Food Log","data":{"Item(s)":"x","Est. Calories":"x kcal","Fiber":"xg","Portion":"x"}}
LOG_CARD:{"type":"activity","title":"🏃 Activity Log","data":{"Activity":"x","Duration":"x min","Gut Benefit":"Motility ↑"}}
LOG_CARD:{"type":"symptom","title":"⚠️ Symptom Log","data":{"Symptom":"x","Severity":"Mild/Moderate/Severe","Tip":"x"}}
LOG_CARD:{"type":"energy","title":"⚡ Energy Log","data":{"Level":"High/Moderate/Low","Score":"x/10","Linked to":"Gut absorption"}}

For greetings or questions, reply normally with no LOG_CARD. Be concise (2-3 sentences). Use **bold** for key terms.`;

const conversationHistory = [];

async function generateResponse(text) {
  conversationHistory.push({ role: 'user', content: text });

  let rawText;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
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
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${res.status}: ${err}`);
    }

    const data = await res.json();
    rawText = data.choices[0].message.content.trim();
  } catch (e) {
    console.error('Groq API error:', e.name === 'AbortError' ? 'Request timed out' : e);
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
