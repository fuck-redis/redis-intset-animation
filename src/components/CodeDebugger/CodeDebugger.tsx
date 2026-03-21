import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnimationStep, CodeLanguage, IntSetOperation } from '../../types/intset';
import { buildDebugInfo, getCodeSnippet, getHighlightedLines } from '../../teaching/intsetCodebook';
import './CodeDebugger.css';

interface CodeDebuggerProps {
  operation: IntSetOperation | null;
  step: AnimationStep | null;
  language: CodeLanguage;
  onLanguageChange: (language: CodeLanguage) => void;
}

const LANGUAGE_OPTIONS: { label: string; value: CodeLanguage }[] = [
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
  { label: 'Golang', value: 'golang' },
  { label: 'JavaScript', value: 'javascript' },
];

const languageMap: Record<CodeLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript',
};

const CodeDebugger: React.FC<CodeDebuggerProps> = ({
  operation,
  step,
  language,
  onLanguageChange,
}) => {
  const code = getCodeSnippet(operation, language);
  const highlightedLines = getHighlightedLines(operation, step, language);
  const lineDebugMap = buildDebugInfo(step, highlightedLines);

  return (
    <section className="code-debugger">
      <div className="code-debugger-header">
        <h3>代码联动调试</h3>
        <div className="language-tabs">
          {LANGUAGE_OPTIONS.map((item) => (
            <button
              key={item.value}
              className={`language-tab ${language === item.value ? 'active' : ''}`}
              onClick={() => onLanguageChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="code-debugger-body">
        <SyntaxHighlighter
          language={languageMap[language]}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            borderRadius: '10px',
            fontSize: '12px',
            lineHeight: 1.45,
            maxHeight: '280px',
          }}
          lineNumberStyle={{
            minWidth: '2.4em',
            color: '#94a3b8',
            opacity: 0.9,
          }}
          lineProps={(lineNumber) =>
            ({
              className: `debug-code-line ${highlightedLines.includes(lineNumber) ? 'is-active' : ''}`,
              'data-debug': lineDebugMap[lineNumber] || '',
            }) as React.HTMLAttributes<HTMLElement>
          }
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </section>
  );
};

export default CodeDebugger;
