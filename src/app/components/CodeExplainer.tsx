'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import hljs from 'highlight.js';
// import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
// import tsx from 'highlight.js/lib/languages/tsx';
// import jsx from 'highlight.js/lib/languages/javascript'; // use JS for JSX
   // Dynamically import Monaco Editor to prevent SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
// const tsx = typescript;
// const jsx = javascript;

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
// hljs.registerLanguage('tsx', tsx);
// hljs.registerLanguage('jsx', jsx);

export default function CodeExplainer() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('typescript');
  const [autoDetected, setAutoDetected] = useState(true);

  useEffect(() => {
    if (code.trim()) {
      const detected = hljs.highlightAuto(code, ['javascript', 'typescript', 'python']);
      if (detected.language && autoDetected) {
        setLanguage(detected.language);
      }
    }
  }, [code, autoDetected]);

//   useEffect(() => {
//   const editorContainer = document.querySelector('.monaco-editor');

//   if (editorContainer) {
//     editorContainer.addEventListener('paste', () => {
//       setTimeout(() => {
//         if (autoDetected && code.trim()) {
//           const detectedLang = detectLanguage(code);
//           setLanguage(detectedLang);
//         }
//       }, 100); // slight delay to allow paste to register
//     });
//   }
// }, [code, autoDetected]);
  const detectLanguage = (code: string): string => {
  const result = hljs.highlightAuto(code, ['javascript', 'typescript', 'python']);
  return result.language || 'javascript'; // fallback
};

  const explainCode = async () => {
     try {
    setLoading(true);
    const res = await fetch('api/explain-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setExplanation(data.explanation);
     }
     catch(err){
      setExplanation(`Failed to get explanation..${err}`);
     }
     finally{ 
        setLoading(false);
    }   
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Code Explanation Tool</h2>
       <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Language:</label>
        <select
          className="border p-2 rounded w-full"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setAutoDetected(false);}
        }
          
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          {/* <option value="tsx">TSX</option>
          <option value="jsx">JSX</option> */}
        </select>
      </div>

       <div className="border rounded mb-4" style={{ height: '300px' }}>
        <MonacoEditor
          language={language}
          value={code}
        //   onChange={(value) => setCode(value || '')}
        onChange={(value) => {
        const newCode = value || '';
        setCode(newCode);

  if (autoDetected && newCode.trim()) {
    const detectedLang = detectLanguage(newCode);
    setLanguage(detectedLang);
  }
}}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      {/* <textarea
        rows={10}
        className="w-full border border-gray-300 p-2 rounded"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      /> */}
      <button
        onClick={explainCode}
        disabled={loading}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Explaining...' : 'Explain Code'}
      </button>

      {explanation && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">
            <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>
          <h3 className="font-semibold mb-2">Explanation:</h3>
          {/* <p>{explanation}</p> */}
           <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{explanation}</div>
        </div>
      )}
    </div>
  );
}
