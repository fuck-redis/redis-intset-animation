import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'bash', 
  title,
  showLineNumbers = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-container">
      {title && (
        <div className="code-block-header">
          <span className="code-block-title">{title}</span>
          <button 
            className="copy-button" 
            onClick={handleCopy}
            title={copied ? '已复制!' : '复制代码'}
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: title ? '0 0 8px 8px' : '8px',
          fontSize: '0.9rem',
          padding: '1.25rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          }
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
      {!title && (
        <button 
          className="copy-button-floating" 
          onClick={handleCopy}
          title={copied ? '已复制!' : '复制代码'}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  );
};

export default CodeBlock;
