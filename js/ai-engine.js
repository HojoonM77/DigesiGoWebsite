/* ── DigestiGo AI Response Engine ─────────────────────────────── */
/* Loaded before app.js; exposes generateResponse() as a global.  */

const INTENTS = {
  food:     /ate|eat|eaten|had|breakfast|lunch|dinner|snack|meal|drank|drink|consumed|calories|fiber|protein|carbs|fat|burger|pizza|salad|fruit|vegetable|soup|rice|bread|pasta|coffee|tea|water|juice|smoothie|yogurt|oats|egg|chicken|fish|beef|salmon|avocado|broccoli|steak|sandwich/i,
  activity: /walk|walked|run|ran|jog|jogged|exercise|gym|swim|swam|yoga|cycle|biked|steps|workout|training|stretch|squat|lift|hiit|cardio|active|sport|hike|hiked/i,
  symptom:  /bloat|bloating|gas|gassy|cramp|cramping|pain|ache|constipat|diarrhea|nausea|nauseous|stool|bowel|ibs|reflux|heartburn|indigestion|burp|full|uncomfortable|distended/i,
  energy:   /tired|fatigue|exhausted|energy|energetic|sluggish|alert|awake|sleepy|refresh|motivated|lazy|lethargic|mood|feel|feeling/i,
};

const SEVERITY = { mild:1, moderate:2, severe:3, bad:2, terrible:3, slight:1, 'a little':1, lot:3, intense:3 };

const FOOD_PARSE  = /(\d+)\s*(cal|calorie|kcal)/i;
const FIBER_PARSE = /(\d+)\s*g?\s*(fiber|fibre)/i;

function parseFood(text) {
  const cals    = text.match(FOOD_PARSE);
  const fiber   = text.match(FIBER_PARSE);
  const portion = text.match(/(\d+)\s*(cup|bowl|piece|slice|serving|gram|oz|ml)/i);
  return {
    calories: cals   ? parseInt(cals[1],10)  : Math.floor(Math.random() * 400) + 100,
    fiber:    fiber  ? parseInt(fiber[1],10) : Math.floor(Math.random() * 8) + 1,
    portion:  portion ? portion[0] : '1 serving',
  };
}

function detectFood(text) {
  const foods = ['oatmeal','eggs','toast','yogurt','salad','pasta','rice','soup',
    'chicken','fish','fruits','vegetables','sandwich','coffee','tea','water',
    'smoothie','steak','salmon','avocado','pizza','burger','broccoli'];
  return foods.filter(f => text.toLowerCase().includes(f));
}

function detectActivity(text) {
  const acts = ['walk','run','jog','yoga','gym','swim','cycle','hike','stretch','lift','cardio','hiit'];
  return acts.filter(a => text.toLowerCase().includes(a));
}

function detectSymptoms(text) {
  const syms = ['bloating','gas','cramping','pain','nausea','constipation',
    'diarrhea','reflux','heartburn','discomfort','indigestion','fullness'];
  return syms.filter(s => text.toLowerCase().includes(s));
}

function parseSeverity(text) {
  const lower = text.toLowerCase();
  for (const [k, v] of Object.entries(SEVERITY)) if (lower.includes(k)) return v;
  return 2;
}

const RESPONSES = {
  food(items, data) {
    const itemStr  = items.length ? items.join(', ') : 'your meal';
    const fibNote  = data.fiber >= 5
      ? 'Great fiber content — this supports gut motility!'
      : data.fiber <= 2
        ? 'That\'s low in fiber. Consider adding leafy greens or legumes.'
        : 'Decent fiber intake.';
    return {
      text: `Logged! I recorded **${itemStr}** (~${data.calories} kcal, ${data.fiber}g fiber). ${fibNote} How\'s your digestive comfort after eating?`,
      card: { type:'food', title:'🥦 Food Log', data: { 'Item(s)': itemStr, 'Est. Calories': `${data.calories} kcal`, 'Fiber': `${data.fiber}g`, 'Portion': data.portion } }
    };
  },
  activity(acts, text) {
    const actStr  = acts.length ? acts.join(', ') : 'activity';
    const dur     = (text.match(/(\d+)\s*(min|minute|hour|hr)/i) || [])[0] || '30 min';
    const steps   = text.match(/(\d[\d,]+)\s*step/i);
    return {
      text: `Activity logged! ${actStr} for ${dur} is excellent for gut motility — physical activity stimulates peristalsis and can reduce bloating. Keep it up! Any digestive symptoms before or after?`,
      card: { type:'activity', title:'🏃 Activity Log', data: { 'Activity': actStr, 'Duration': dur, 'Steps': steps ? steps[1] : 'N/A', 'Gut Benefit': 'Motility ↑' } }
    };
  },
  symptom(syms, text) {
    const severity  = parseSeverity(text);
    const sevLabel  = ['','Mild','Moderate','Severe'][severity];
    const symStr    = syms.length ? syms.join(', ') : 'symptom';
    const tips = {
      bloating:     'Try peppermint tea or a gentle walk. Avoid carbonated drinks.',
      gas:          'Reduce FODMAP foods like beans, lentils, onions temporarily.',
      cramping:     'Stay hydrated and apply a warm compress to the abdomen.',
      nausea:       'Ginger tea or small sips of water may help. Rest upright.',
      reflux:       'Avoid lying down for 2–3 hours after eating. Elevate head during sleep.',
      heartburn:    'Avoid spicy foods and eat smaller meals.',
      constipation: 'Increase fiber and water intake. A 10-minute walk can help.',
    };
    const tip = tips[syms[0]] || 'Stay hydrated and rest. Track if it worsens.';
    return {
      text: `Symptom logged as **${sevLabel} ${symStr}**. ${tip} I\'ll track this pattern over time. When did this start — before or after a meal?`,
      card: { type:'symptom', title:'⚠️ Symptom Log', data: { 'Symptom': symStr, 'Severity': `${sevLabel} (${severity}/3)`, 'Tip': tip.slice(0, 35) + '…' } }
    };
  },
  energy(text) {
    const level = /high|great|good|energetic|alert|refresh|motivated/i.test(text) ? 'High'
      : /low|tired|fatigue|slug|exhaust|letharg/i.test(text) ? 'Low'
      : 'Moderate';
    const score = level === 'High' ? 8 : level === 'Low' ? 3 : 5;
    const note  = level === 'Low'
      ? 'Low energy can be linked to gut inflammation or poor nutrient absorption. Try a light protein snack and stay hydrated.'
      : level === 'High'
        ? 'Great! High energy often correlates with good gut health and balanced nutrition.'
        : 'Moderate energy. Ensure you\'re hitting your fiber and hydration targets.';
    return {
      text: `Energy logged as **${level}** (${score}/10). ${note}`,
      card: { type:'energy', title:'⚡ Energy Log', data: { 'Level': level, 'Score': `${score}/10`, 'Linked to': 'Gut absorption' } }
    };
  },
  greeting: () => ({
    text: 'Hey! I\'m DigestiBot, your gut health AI assistant 🌿 Tell me what you\'ve eaten, any activity you\'ve done, digestive symptoms you\'re experiencing, or how your energy feels. I\'ll track it all and help you understand your gut patterns.',
    card: null
  }),
  help: () => ({
    text: 'I can track:\n• **🥦 Food & Diet** — "I had oatmeal for breakfast with 4g fiber"\n• **🏃 Activity** — "I went for a 30-minute jog"\n• **⚠️ Symptoms** — "I\'m experiencing mild bloating after lunch"\n• **⚡ Energy** — "Feeling low energy this afternoon"\n\nJust tell me naturally and I\'ll log it!',
    card: null
  }),
  fallback: () => ({
    text: 'I\'m here to help track your gut health! Tell me about a meal you had, physical activity, any digestive symptoms, or your energy level. You can speak naturally — I\'ll pick up the details.',
    card: null
  }),
};

function generateResponse(text) {
  const lower = text.toLowerCase().trim();
  if (/^(hi|hello|hey|good morning|good evening|howdy)/.test(lower)) return RESPONSES.greeting();
  if (/help|what can you|how do i|how does/.test(lower))             return RESPONSES.help();
  if (INTENTS.symptom.test(text))  { return RESPONSES.symptom(detectSymptoms(text), text); }
  if (INTENTS.food.test(text))     { return RESPONSES.food(detectFood(text), parseFood(text)); }
  if (INTENTS.activity.test(text)) { return RESPONSES.activity(detectActivity(text), text); }
  if (INTENTS.energy.test(text))   { return RESPONSES.energy(text); }
  return RESPONSES.fallback();
}
