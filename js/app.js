/* ── DigestiGo React App ──────────────────────────────────────── */
/* Depends on: ai-engine.js, seed-data.js (loaded before this)    */
/* Uses React 18 + ReactDOM via CDN, transpiled by Babel standalone */

console.log('📍 app.js: START - checking availability');
console.log('📌 React available?', typeof React !== 'undefined');
console.log('📌 ReactDOM available?', typeof ReactDOM !== 'undefined');
console.log('📌 seedData available?', typeof seedData !== 'undefined');
console.log('📌 generateResponse available?', typeof generateResponse !== 'undefined');
console.log('📌 HINTS available?', typeof HINTS !== 'undefined');
console.log('📌 SIDEBAR_PROMPTS available?', typeof SIDEBAR_PROMPTS !== 'undefined');

console.log('📍 app.js: destructuring React hooks');
const { useState, useEffect, useRef, useCallback } = React;
console.log('📍 app.js: hooks destructured successfully');

/* ── Chart Components ─────────────────────────────────────────── */
console.log('📍 app.js: defining BarChart');
function BarChart({ data, color = '#00e676' }) {
  const max = Math.max(...data.map(d => d.val), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div
            className={`bar ${d.today ? 'active' : ''}`}
            style={{ height: `${(d.val / max) * 80}px`, background: d.today ? color : undefined }}
          >
            <span className="bar-val">{d.val}</span>
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, color = '#00e676' }) {
  const W = 320, H = 90, PAD = 10;
  const vals  = data.map(d => d.val);
  const max   = Math.max(...vals, 1);
  const min   = Math.min(...vals, 0);
  const range = max - min || 1;
  const pts   = vals.map((v, i) => {
    const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (v - min) / range) * (H - PAD * 2);
    return [x, y];
  });
  const polyline = pts.map(p => p.join(',')).join(' ');
  const area     = `${pts[0][0]},${H} ${polyline} ${pts[pts.length - 1][0]},${H}`;
  const gid      = `grad-${color.replace('#', '')}`;
  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity=".3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gid})`}/>
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y}
            r={i === pts.length - 1 ? 4 : 2.5}
            fill={i === pts.length - 1 ? color : '#0f150f'}
            stroke={color} strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}

function GaugeBar({ label, val, max, color }) {
  const pct = Math.round((val / max) * 100);
  return (
    <div className="gauge-item">
      <div className="gauge-row">
        <span className="gauge-label">{label}</span>
        <span className="gauge-val">{val}/{max}</span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

function EnergyRing({ score }) {
  const R    = 36;
  const C    = 2 * Math.PI * R;
  const pct  = score / 10;
  const dash = C * pct;
  const gap  = C * (1 - pct);
  return (
    <svg className="ring-svg" width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={R} fill="none" stroke="#162016" strokeWidth="8"/>
      <circle cx="45" cy="45" r={R} fill="none" stroke="#00e676" strokeWidth="8"
        strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
        transform="rotate(-90 45 45)"
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />
      <text x="45" y="48" textAnchor="middle" fill="#00e676" fontSize="16" fontWeight="700" fontFamily="Courier New">{score}</text>
      <text x="45" y="60" textAnchor="middle" fill="#7a9b7a" fontSize="9">/10</text>
    </svg>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
console.log('📍 app.js: defining App component');
function App() {
  console.log('📍 App component called - initializing state');
  const [tab, setTab]         = useState('chat');
  console.log('📍 App: tab state created');
  const [messages, setMessages] = useState([{
    id: 1, role: 'ai', card: null,
    text: 'Hello! I\'m **DigestiBot**, your AI gut health companion 🌿\n\nI\'m here to help you track your **diet**, **activity**, **digestive symptoms**, and **energy levels** — all through natural conversation.\n\nTell me what you\'ve eaten today, any symptoms you\'re feeling, or activities you\'ve done, and I\'ll log everything and offer digestive health insights!',
    time: '09:00',
  }]);
  console.log('📍 App: messages state created');
  const [input, setInput]     = useState('');
  console.log('📍 App: input state created');
  const [typing, setTyping]   = useState(false);
  console.log('📍 App: typing state created');
  const [logCount, setLogCount] = useState(0);
  console.log('📍 App: logCount state created');
  const [logs, setLogs]       = useState([]);
  console.log('📍 App: logs state created');
  const [seedD]               = useState(() => {
    console.log('📍 seedData initializer running');
    try {
      const data = seedData();
      console.log('📍 seedData initialized successfully');
      return data;
    } catch (e) {
      console.error('❌ seedData error:', e);
      return { todayStats: {}, calorieWeek: [], fiberWeek: [], stepsWeek: [], energyWeek: [], symptoms: [] };
    }
  });
  console.log('📍 App: seedData state created');
  const messagesEndRef        = useRef(null);
  console.log('📍 App: all state initialized successfully');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { id: Date.now(), role: 'user', text, card: null, time: now() }]);
    setInput('');
    setTyping(true);
    const resp  = await generateResponse(text);
    const aiMsg = { id: Date.now() + 1, role: 'ai', text: resp.text, card: resp.card, time: now() };
    setMessages(m => [...m, aiMsg]);
    setTyping(false);
    if (resp.card) {
      setLogCount(c => c + 1);
      setLogs(l => [{ ...resp.card, timestamp: now(), raw: text }, ...l]);
    }
  }, [input]);

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const renderMarkdown = text => {
    try {
      let result = text.replace(/\*\*([^\*]+)\*\*/g, '<strong style="color:#d4e8d4">$1</strong>');
      result = result.replace(/\n/g, '<br/>');
      return result;
    } catch (e) {
      console.error('renderMarkdown error:', e);
      return text.replace(/\n/g, '<br/>');
    }
  };

  const stats = seedD.todayStats;

  console.log('📍 App: about to return JSX');

  return (
    <div className="app">
      {/* Extremely visible test bar */}
      <div style={{background: '#FFFF00', color: '#000', padding: '20px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center'}}>
        🎉 APP IS RENDERING 🎉
      </div>
      
      {/* App Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8.5c-.4-1.3-1.4-2.3-2.7-2.7-.7-.2-1.4-.1-2 .2-.3.2-.7.2-1 0-.6-.4-1.3-.5-2-.4C7.9 5.9 6.5 7 6 8.4c-.3.9-.2 1.9.2 2.7.5 1 .6 2.2.2 3.3-.4 1-.6 2.2-.2 3.3.5 1.5 1.9 2.6 3.5 2.9 1 .2 2 .2 3 0 1-.2 1.9-.7 2.6-1.5.6-.7.9-1.6.9-2.5 0-.7-.2-1.4-.2-2.1 0-.5.1-1 .3-1.5.6-1.1.9-2.4.7-3.7z"/></svg>
          </div>
          Digesti<span>Go</span>
        </div>
        <div className="header-right">
          <div className="status-pill"><div className="status-dot"/><span>AI Active</span></div>
          <span className="date-badge">{today}</span>
        </div>
      </header>

      {/* App Nav */}
      <nav className="app-nav">
        {[
          { id: 'chat',      icon: '💬', label: 'Chat Tracker', badge: logCount > 0 ? logCount : null },
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'history',   icon: '📋', label: 'Log History', badge: logs.length > 0 ? logs.length : null },
        ].map(t => (
          <button key={t.id} className={`app-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
            {t.badge && <span className="badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      <main className="app-main">

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          <div className="chat-page">
            {/* Sidebar */}
            <aside className="chat-sidebar">
              <div className="sidebar-section">
                <div className="sidebar-title">Today's Stats</div>
                {[
                  { icon: '🍽️', label: 'Calories', val: `${stats.calories} kcal` },
                  { icon: '🌾', label: 'Fiber',    val: `${stats.fiber}g` },
                  { icon: '👟', label: 'Steps',    val: stats.steps.toLocaleString() },
                  { icon: '⚡', label: 'Energy',   val: `${stats.energy}/10` },
                  { icon: '💧', label: 'Water',    val: `${stats.water} glasses` },
                ].map(s => (
                  <div key={s.label} className="quick-stat">
                    <div className="qs-left"><span className="qs-icon">{s.icon}</span><span className="qs-label">{s.label}</span></div>
                    <span className="qs-val">{s.val}</span>
                  </div>
                ))}
              </div>
              <div className="sidebar-section">
                <div className="sidebar-title">Quick Log</div>
                <div className="prompt-chip-list">
                  {SIDEBAR_PROMPTS.map(p => (
                    <button key={p} className="prompt-chip" onClick={() => setInput(p.slice(2).trim())}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="sidebar-tips">
                <div className="sidebar-title">Gut Insights</div>
                {[
                  { icon: '🌿', text: 'Aim for 25–38g of fiber daily for optimal gut health.' },
                  { icon: '💧', text: '8+ glasses of water supports bowel regularity.' },
                  { icon: '🚶', text: 'Even a 10-min walk after meals reduces bloating.' },
                  { icon: '🧘', text: 'Stress directly impacts your gut microbiome.' },
                ].map((tip, i) => (
                  <div key={i} className="tip-item"><span className="icon">{tip.icon}</span><span>{tip.text}</span></div>
                ))}
              </div>
            </aside>

            {/* Chat main */}
            <div className="chat-main">
              <div className="chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`msg ${msg.role}`}>
                    <div className={`avatar ${msg.role}`}>{msg.role === 'ai' ? '🤖' : '👤'}</div>
                    <div>
                      <div className="bubble">
                        <span>{msg.text}</span>
                        {msg.card && (
                          <div className="log-card">
                            <div className="log-card-title">{msg.card.title} — Logged</div>
                            {Object.entries(msg.card.data || {}).map(([k, v]) => (
                              <div key={k} className="log-card-row">
                                <span>{k}</span><span className="log-card-val">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bubble-meta">{msg.time}</div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="msg ai">
                    <div className="avatar ai">🤖</div>
                    <div className="bubble"><div className="typing"><span/><span/><span/></div></div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>
              <div className="chat-input-wrap">
                <div className="chat-input-row">
                  <textarea
                    className="chat-textarea"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Tell me what you ate, how you feel, or any symptoms… (Enter to send)"
                    rows={1}
                  />
                  <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || typing}>➤</button>
                </div>
                <div className="input-hints">
                  {HINTS.map(h => (
                    <button key={h} className="hint-chip" onClick={() => setInput(h)}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div className="dashboard">
            <div className="dash-grid">
              {[
                { label: 'Calories Today',  val: '1,750',  sub: 'of 2,000 goal',          icon: '🍽️' },
                { label: 'Fiber Intake',    val: '19g',    sub: 'of 30g recommended',      icon: '🌾' },
                { label: 'Steps Today',     val: '5,800',  sub: '+12% vs avg',              icon: '👟' },
                { label: 'Energy Score',    val: '5/10',   sub: 'Moderate — see insights', icon: '⚡' },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <div className="sc-icon">{c.icon}</div>
                  <div className="sc-label">{c.label}</div>
                  <div className="sc-val">{c.val}</div>
                  <div className="sc-sub">{c.sub}</div>
                </div>
              ))}
            </div>

            <div className="dash-row">
              <div className="panel">
                <div className="panel-title"><div className="dot"/>Weekly Calorie Intake</div>
                <BarChart data={seedD.calorieWeek}/>
              </div>
              <div className="panel">
                <div className="panel-title"><div className="dot" style={{ background: '#69f0ae' }}/>Daily Fiber (g)</div>
                <BarChart data={seedD.fiberWeek} color="#69f0ae"/>
              </div>
            </div>

            <div className="dash-row">
              <div className="panel">
                <div className="panel-title"><div className="dot" style={{ background: '#40c4ff' }}/>Step Count — 7 Days</div>
                <LineChart data={seedD.stepsWeek} color="#40c4ff"/>
              </div>
              <div className="panel">
                <div className="panel-title"><div className="dot" style={{ background: '#ce93d8' }}/>Energy Level — 7 Days</div>
                <LineChart data={seedD.energyWeek} color="#ce93d8"/>
              </div>
            </div>

            <div className="dash-row three">
              <div className="panel">
                <div className="panel-title"><div className="dot" style={{ background: '#ffab40' }}/>Symptom Severity (week avg)</div>
                <div className="gauge-list">
                  {seedD.symptoms.map(s => <GaugeBar key={s.label} {...s}/>)}
                </div>
              </div>
              <div className="panel">
                <div className="panel-title"><div className="dot" style={{ background: '#ce93d8' }}/>Energy Today</div>
                <div className="energy-ring">
                  <EnergyRing score={stats.energy}/>
                  <div className="ring-info">
                    {[
                      { color: '#00e676', label: 'Morning',   val: '6/10' },
                      { color: '#69f0ae', label: 'Afternoon', val: '5/10' },
                      { color: '#ce93d8', label: 'Evening',   val: '4/10' },
                    ].map(r => (
                      <div key={r.label} className="ring-stat">
                        <div className="ring-dot" style={{ background: r.color }}/>
                        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{r.label}</span>
                        <span style={{ color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', marginLeft: 'auto' }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-title"><div className="dot"/>Gut Health Insights</div>
                <div className="insight-list">
                  <div className="insight-card warn"><strong>⚠️ Low Fiber Day</strong>Only 19g today — aim for 30g. Add legumes or whole grains.</div>
                  <div className="insight-card"><strong>✅ Good Hydration</strong>6 glasses logged. Stay consistent through the evening.</div>
                  <div className="insight-card"><strong>🚶 Activity Boosts Gut</strong>Your bloating score drops on high-step days.</div>
                  <div className="insight-card danger"><strong>😣 Bloating Pattern</strong>Bloating noted 3 of last 7 days — possibly FODMAP-related.</div>
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="panel-title"><div className="dot"/>Recent Log Entries</div>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  No entries yet — start chatting to log data!
                </p>
              ) : (
                <table className="log-table">
                  <thead><tr><th>Time</th><th>Type</th><th>Details</th></tr></thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{l.timestamp}</td>
                        <td><span className={`tag ${l.type}`}>{l.type}</span></td>
                        <td>{Object.values(l.data).slice(0, 2).join(' · ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div className="history-page">
            {logs.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📋</div>
                <p>No log entries yet</p>
                <small>Go to the Chat tab and start telling DigestiBot about your meals, symptoms, and activity.</small>
              </div>
            ) : (
              <div className="timeline">
                <div className="timeline-day">
                  <div className="timeline-date">{today}</div>
                  <div className="timeline-entries">
                    {logs.map((l, i) => {
                      const icons = { food: '🥦', activity: '🏃', symptom: '⚠️', energy: '⚡' };
                      const details = Object.entries(l.data).map(([k, v]) => `${k}: ${v}`).join(' · ');
                      return (
                        <div key={i} className="tl-entry">
                          <span className="tl-time">{l.timestamp}</span>
                          <span className="tl-icon">{icons[l.type] || '📝'}</span>
                          <div className="tl-body">
                            <div className="tl-title">{l.title}</div>
                            <div className="tl-detail">{details}</div>
                            <div style={{ marginTop: 4 }}><span className={`tag ${l.type}`}>{l.type}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sample historical days */}
                {[
                  { date: 'Yesterday', entries: [
                    { time: '08:15', icon: '🥦', title: '🥦 Food Log — Logged',     detail: 'Item(s): oatmeal, berries · Est. Calories: 380 kcal', type: 'food' },
                    { time: '12:00', icon: '🏃', title: '🏃 Activity Log — Logged', detail: 'Activity: yoga · Duration: 30 min', type: 'activity' },
                    { time: '19:30', icon: '⚠️', title: '⚠️ Symptom Log — Logged', detail: 'Symptom: bloating · Severity: Mild (1/3)', type: 'symptom' },
                    { time: '21:00', icon: '⚡', title: '⚡ Energy Log — Logged',   detail: 'Level: Moderate · Score: 6/10', type: 'energy' },
                  ]},
                  { date: '2 Days Ago', entries: [
                    { time: '07:30', icon: '🥦', title: '🥦 Food Log — Logged',     detail: 'Item(s): eggs, toast · Est. Calories: 420 kcal', type: 'food' },
                    { time: '17:00', icon: '🏃', title: '🏃 Activity Log — Logged', detail: 'Activity: run · Duration: 45 min · Steps: 5200', type: 'activity' },
                    { time: '20:00', icon: '⚡', title: '⚡ Energy Log — Logged',   detail: 'Level: High · Score: 8/10', type: 'energy' },
                  ]},
                ].map(day => (
                  <div key={day.date} className="timeline-day">
                    <div className="timeline-date">{day.date}</div>
                    <div className="timeline-entries">
                      {day.entries.map((e, i) => (
                        <div key={i} className="tl-entry">
                          <span className="tl-time">{e.time}</span>
                          <span className="tl-icon">{e.icon}</span>
                          <div className="tl-body">
                            <div className="tl-title">{e.title}</div>
                            <div className="tl-detail">{e.detail}</div>
                            <div style={{ marginTop: 4 }}><span className={`tag ${e.type}`}>{e.type}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

try {
  console.log('📍 React render: starting...');
  console.log('📍 React render: creating root...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('📍 React render: root created, calling render...');
  root.render(<App/>);
  console.log('✅ App rendered successfully!');
  console.log('📍 React render: complete');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  console.error('❌ Error message:', error.message);
  console.error('❌ Error stack:', error.stack);
  const errorDiv = document.getElementById('error-display');
  if (errorDiv) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = `APPLICATION ERROR\n\n${error.message}\n\nStack:\n${error.stack}\n\nContext:\nwindow.logs = ${JSON.stringify(window.logs || [], null, 2)}`;
  }
  document.getElementById('root').innerHTML = `<div style="color: #ff5252; padding: 20px; font-family: monospace; white-space: pre-wrap;">ERROR: ${error.message}</div>`;
}
