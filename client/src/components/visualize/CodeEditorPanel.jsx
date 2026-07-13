export default function CodeEditorPanel({ code, onChange }) {
  const lines = code.split('\n');
  return (
    <div
      style={{
        display: 'flex', background: 'var(--surface-container-lowest)',
        border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
      }}
    >
      <div
        style={{
          padding: '12px 8px', textAlign: 'right', color: 'var(--muted)',
          userSelect: 'none', background: 'var(--surface)', minWidth: 36,
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ lineHeight: '1.6' }}>
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, minHeight: 240, padding: 12, background: 'transparent', color: 'var(--text)',
          border: 'none', outline: 'none', resize: 'vertical', lineHeight: '1.6',
          fontFamily: 'inherit', fontSize: 'inherit',
        }}
      />
    </div>
  );
}
