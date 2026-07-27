import React, { useState } from "react";
import AppShell from "../../components/AppShell";
import StepLog from "../../components/StepLog";
import { Play, Square, RotateCcw, Code, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

const TEMPLATES = {
  python: `# Python Custom Algorithm Visualizer
# Print your execution steps line-by-line to see them animate in the Step Log!
def custom_bubble_sort(arr):
    n = len(arr)
    print(f"Starting Custom Bubble Sort with array: {arr}")
    for i in range(n):
        for j in range(0, n - i - 1):
            print(f"Comparing arr[{j}]={arr[j]} and arr[{j+1}]={arr[j+1]}")
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                print(f"Swapped! Array is now: {arr}")
    print(f"Sorting Complete! Final array: {arr}")

# Run the algorithm
custom_bubble_sort([45, 12, 85, 32, 8])
`,
  java: `// Java Custom Algorithm Visualizer
// Print your execution steps using System.out.println() to see them animate live!
public class Solution {
    public static void main(String[] args) {
        int[] arr = {45, 12, 85, 32, 8};
        int n = arr.length;
        
        System.out.println("Starting Java Bubble Sort...");
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                System.out.println("Comparing index " + j + " (" + arr[j] + ") and " + (j+1) + " (" + arr[j+1] + ")");
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    System.out.println("Swapped " + arr[j] + " and " + arr[j+1]);
                }
            }
        }
        System.out.println("Sorting Complete! Array successfully sorted.");
    }
}
`
};

export default function VisualizeMyCodePage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(TEMPLATES.python);
  const [isRunning, setIsRunning] = useState(false);
  const [stepLog, setStepLog] = useState([]);
  const [error, setError] = useState(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang]);
    setStepLog([]);
    setError(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setError(null);
    setStepLog([{ text: `Initializing ${language.toUpperCase()} execution environment...`, type: "info" }]);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/visualize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ language, code })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || "Execution failed.");
        setStepLog(prev => [...prev, { text: "Execution aborted due to runtime error.", type: "danger" }]);
      } else if (data.frames) {
        // Animate the returned step logs sequentially
        setStepLog([]);
        for (let i = 0; i < data.frames.length; i++) {
          await new Promise(r => setTimeout(r, 400));
          const frame = data.frames[i];
          setStepLog(prev => [...prev, { text: frame.log || JSON.stringify(frame), type: frame.type || "compare" }]);
        }
      }
    } catch (err) {
      setError("Failed to connect to the backend server. Make sure your Express server is running!");
      setStepLog(prev => [...prev, { text: "Network connection error.", type: "danger" }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppShell breadcrumb="Code Playground / Visualize My Code">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h1 className="section-title">Visualize My Code</h1>
          <p className="section-sub">Write or paste your custom Python or Java algorithm and watch it execute step-by-step.</p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--surface2)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <button
              onClick={() => handleLanguageChange("python")}
              style={{
                padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px",
                background: language === "python" ? "var(--primary)" : "transparent",
                color: language === "python" ? "var(--bg)" : "var(--text)"
              }}
            >
              Python
            </button>
            <button
              onClick={() => handleLanguageChange("java")}
              style={{
                padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px",
                background: language === "java" ? "var(--primary)" : "transparent",
                color: language === "java" ? "var(--bg)" : "var(--text)"
              }}
            >
              Java
            </button>
          </div>

          <button
            onClick={() => setCode(TEMPLATES[language])}
            className="btn btn-ghost"
            title="Reset to sample algorithm"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {isRunning ? <Square size={16} /> : <Play size={16} />}
            {isRunning ? "Running..." : "Run & Visualize"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--red)", color: "var(--red)", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span><strong>Runtime Error:</strong> {error}</span>
        </div>
      )}

      {/* Editor & Output Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", minHeight: "560px" }}>
        {/* Left: Code Editor Area */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "var(--surface2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "13px" }}>
            <Code size={16} style={{ color: "var(--cyan)" }} />
            <span>Source Editor ({language.toUpperCase()})</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={{
              flex: 1, width: "100%", padding: "16px", background: "var(--surface-container-lowest)",
              border: "none", color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px", lineHeight: "1.6", resize: "none", outline: "none"
            }}
          />
        </div>

        {/* Right: Live Step Log */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <StepLog steps={stepLog} />
        </div>
      </div>
    </AppShell>
  );
}