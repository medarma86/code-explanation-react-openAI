'use client';
import {  useState } from 'react';
import dynamic from 'next/dynamic';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Monaco Editor needs to be dynamically imported to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function DetectAndCodeExplainer() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('typescript');
  const [autoDetected, setAutoDetected] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const detectLanguageAI = async (code: string): Promise<string> => {
    setDetecting(true);
    try {
      const res = await fetch('/api/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      return data.language || 'typescript';
    } catch (err) {
      console.error('Language detection failed:', err);
      return 'typescript';
    } finally {
      setDetecting(false);
    }
  };

  const explainCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation(`Failed to get explanation. Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = async (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);

    if (autoDetected && newCode.trim()) {
      const detectedLang = await detectLanguageAI(newCode);
      setLanguage(detectedLang);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Code Explainer with AI</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Language:</label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setAutoDetected(false);
          }}
          className="w-full border p-2 rounded"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        {autoDetected && <p className="text-sm text-gray-600 mt-1">Detected: {detecting ? 'Detecting...' : language}</p>}
      </div>

      <div className="mb-4 border rounded" style={{ height: '300px' }}>
        <MonacoEditor
          language={language}
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      <button
        onClick={explainCode}
        disabled={loading || !code.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Explaining...' : 'Explain Code'}
      </button>

      {explanation && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow">
          <h3 className="font-semibold mb-2">Code:</h3>
          <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>

          <h3 className="font-semibold mt-4 mb-2">Explanation:</h3>
          <div className="bg-white p-3 rounded whitespace-pre-wrap border">{explanation}</div>
        </div>
      )}
    </div>
  );
}
