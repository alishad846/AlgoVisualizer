import React, { useState } from "react";
import { getSnippet } from "../data/codeSnippets";

const LANGUAGES = [
  { key: "C", label: "C" },
  { key: "CPlusPlus", label: "C++" },
  { key: "Java", label: "Java" },
  { key: "Python", label: "Python" },
  { key: "JavaScript", label: "JavaScript" },
];

// Safe, single-pass tokenizer matching design system
function safeHighlightLine(line) {
  if (!line) return "";
  let text = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  const commentIdx = text.indexOf("//") !== -1 ? text.indexOf("//") : text.indexOf("#");
  let codePart = text;
  let commentPart = "";
  if (commentIdx !== -1) {
    codePart = text.slice(0, commentIdx);
    commentPart = text.slice(commentIdx);
  }

  // Split codePart by words, numbers, or strings
  const tokens = codePart.split(/(\b\w+\b|"[^"]*"|'[^']*')/g);
  const keywords = new Set([
    "void", "int", "float", "double", "boolean", "bool", "char", "string", "vector", "list", "map", "set", "queue", "stack",
    "public", "private", "protected", "class", "struct", "def", "function", "const", "let", "var", "return", "for", "while",
    "if", "else", "elif", "import", "using", "namespace", "length", "size", "range", "in", "swap", "new", "true", "false",
    "nullptr", "None", "null"
  ]);

  const styledTokens = tokens.map((token, i) => {
    if (keywords.has(token)) {
      return `<span key="${i}" style="color: var(--cyan); font-weight: 700;">${token}</span>`;
    }
    if (/^\d+$/.test(token)) {
      return `<span key="${i}" style="color: var(--orange); font-weight: 600;">${token}</span>`;
    }
    if (/^("[^"]*"|'[^']*')$/.test(token)) {
      return `<span key="${i}" style="color: var(--green);">${token}</span>`;
    }
    return token;
  });

  let res = styledTokens.join("");
  if (commentPart) {
    res += `<span style="color: var(--muted); font-style: italic;">${commentPart}</span>`;
  }
  return res;
}

export default function MultiLangCode({ algoKey }) {
  const [activeLang, setActiveLang] = useState("C");
  const [copied, setCopied] = useState(false);

  const snippets = getSnippet(algoKey);
  const currentCode = snippets[activeLang] || "";
  const lines = currentCode.split("\n");

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="multi-lang-panel" style={{
      marginTop: "28px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
    }}>
      {/* Header bar matching user's clean screenshot */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        padding: "16px 20px 12px 20px",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 900,
            letterSpacing: "1px",
            color: "var(--text)",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            SOURCE CODE
          </div>
          <div style={{ width: "40px", height: "3px", background: "var(--cyan)", borderRadius: "2px" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px", background: "var(--surface2)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border2)" }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.key}
                onClick={() => setActiveLang(lang.key)}
                style={{
                  background: activeLang === lang.key ? "var(--primary)" : "transparent",
                  color: activeLang === lang.key ? "var(--bg)" : "var(--text)",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: activeLang === lang.key ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: copied ? "var(--green)" : "var(--surface2)",
              color: copied ? "#ffffff" : "var(--text)",
              border: "1px solid var(--border2)",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Copied! ✓" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Code Display Area with line numbers */}
      <div style={{
        padding: "16px 0",
        background: "var(--surface-container-lowest)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        lineHeight: "1.7",
        overflowX: "auto"
      }}>
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          return (
            <div key={idx} style={{
              display: "flex",
              padding: "2px 20px",
              alignItems: "center"
            }}>
              <span style={{
                width: "36px",
                textAlign: "right",
                marginRight: "20px",
                color: "var(--muted)",
                fontSize: "12px",
                userSelect: "none",
                opacity: 0.7
              }}>
                {lineNum}
              </span>
              <span
                style={{ whiteSpace: "pre", color: "var(--text)" }}
                dangerouslySetInnerHTML={{ __html: safeHighlightLine(line) }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
