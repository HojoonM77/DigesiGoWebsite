/* ── Mock Seed Data & Constants ───────────────────────────────── */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function seedData() {
  return {
    calorieWeek: DAYS.map((d, i) => ({ label: d, val: [1800,2100,1650,2200,1900,2400,1750][i], today: i === 6 })),
    fiberWeek:   DAYS.map((d, i) => ({ label: d, val: [22,18,28,15,24,30,19][i],              today: i === 6 })),
    stepsWeek:   DAYS.map((d, i) => ({ label: d, val: [6200,8100,4500,9200,7400,10500,5800][i], today: i === 6 })),
    energyWeek:  DAYS.map((d, i) => ({ label: d, val: [6,7,5,8,6,9,5][i] })),
    symptoms: [
      { label: 'Bloating',  val: 2, max: 5, color: '#ffab40' },
      { label: 'Gas',       val: 1, max: 5, color: '#ff7043' },
      { label: 'Cramping',  val: 1, max: 5, color: '#ff5252' },
      { label: 'Nausea',    val: 0, max: 5, color: '#ab47bc' },
      { label: 'Reflux',    val: 0, max: 5, color: '#ef5350' },
    ],
    todayStats: { calories: 1750, fiber: 19, steps: 5800, energy: 5, water: 6, meals: 3 },
  };
}

const HINTS = [
  'I had oatmeal for breakfast',
  'Went for a 20-min walk',
  'Mild bloating after dinner',
  'Feeling low energy today',
  'Drank 8 glasses of water',
];

const SIDEBAR_PROMPTS = [
  '🥑 Log a meal',
  '🏃 Log an activity',
  '😣 Log a symptom',
  '⚡ Log my energy',
  '💧 Log water intake',
];
