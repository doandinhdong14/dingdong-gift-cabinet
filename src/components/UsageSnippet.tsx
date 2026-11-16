import React, { useState } from 'react';
import { Copy, Check, AlertCircle, FileCode, Sparkles, Braces } from 'lucide-react';
import { AssetConfig, AssetManifest } from '../gift-library/types';
import {
  generateConfigJson,
  generateJsxSnippet,
  generateAiInstructions,
} from '../utils/codeGeneration';

export interface UsageSnippetProps {
  manifest: AssetManifest;
  config: AssetConfig;
}

type SnippetTab = 'jsx' | 'json' | 'ai';

export const UsageSnippet: React.FC<UsageSnippetProps> = ({ manifest, config }) => {
  const [activeTab, setActiveTab] = useState<SnippetTab>('jsx');
  const [copySuccess, setCopySuccess] = useState<boolean | null>(null);
  const [showManualFallback, setShowManualFallback] = useState<boolean>(false);

  const jsonSnippet = generateConfigJson(config);
  const jsxSnippet = generateJsxSnippet(manifest, config);
  const aiSnippet = generateAiInstructions(manifest, config);

  const getCurrentSnippetText = () => {
    switch (activeTab) {
      case 'jsx':
        return jsxSnippet;
      case 'json':
        return jsonSnippet;
      case 'ai':
        return aiSnippet;
    }
  };

  const handleCopy = async () => {
    const text = getCurrentSnippetText();
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setShowManualFallback(false);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for blocked clipboard permissions
      setCopySuccess(false);
      setShowManualFallback(true);
    }

    setTimeout(() => {
      setCopySuccess(null);
    }, 3000);
  };

  return (
    <div className="usage-snippet-container" role="region" aria-label="Đoạn mã và hướng dẫn sử dụng">
      {/* Sub tabs */}
      <div className="snippet-tabs-header">
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${activeTab === 'jsx' ? 'active' : ''}`}
            onClick={() => setActiveTab('jsx')}
          >
            <FileCode size={14} /> Mã nguồn React (JSX)
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Braces size={14} /> Cấu hình (JSON)
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Sparkles size={14} /> Lệnh cho AI
          </button>
        </div>

        <button
          type="button"
          className="btn-copy-code"
          onClick={handleCopy}
          aria-label="Sao chép nội dung đang chọn"
        >
          {copySuccess === true ? (
            <>
              <Check size={14} className="text-success" />
              <span>Đã sao chép!</span>
            </>
          ) : copySuccess === false ? (
            <>
              <AlertCircle size={14} className="text-danger" />
              <span>Không truy cập được Clipboard</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      {showManualFallback ? (
        <div className="manual-copy-area">
          <p className="manual-copy-hint">
            Trình duyệt chặn truy cập bộ nhớ tạm (Clipboard). Bạn có thể chọn và sao chép thủ công bên dưới:
          </p>
          <textarea
            readOnly
            value={getCurrentSnippetText()}
            className="manual-copy-textarea"
            rows={12}
            onFocus={(e) => e.target.select()}
          />
        </div>
      ) : (
        <div className="code-block-wrapper">
          <pre className="code-pre">
            <code>{getCurrentSnippetText()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default UsageSnippet;
