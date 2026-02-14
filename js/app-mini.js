console.log('📍 app-mini.js: START');

const { useState, useEffect, useRef, useCallback } = React;

console.log('📍 App: defining App component');

function App() {
  console.log('📍 App: function called');
  
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hello! I\'m DigestiBot' }
  ]);
  const [input, setInput] = useState('');
  
  console.log('📍 App: state initialized');
  
  return (
    <div className="app" style={{ background: '#070b07', color: '#d6ead6', height: '100vh' }}>
      <h1 style={{ padding: '20px' }}>✅ DigestiGo is Working!</h1>
      <p style={{ padding: '0 20px' }}>React is rendering correctly.</p>
    </div>
  );
}

console.log('📍 App: defined, attempting to render');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App/>);
  console.log('✅ SUCCESS: App rendered');
} catch (error) {
  console.error('❌ RENDER ERROR:', error.message);
  console.error(error.stack);
  document.getElementById('root').innerHTML = `<div style="padding: 20px; color: red; white-space: pre-wrap; font-family: monospace;">ERROR: ${error.message}<br/>${error.stack}</div>`;
}
