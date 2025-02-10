import { InputField } from './InputField.js';
import { SEARCH_RECENCY_OPTIONS } from '../../constants/index.js';

export const AdvancedSettings = ({ 
  topK, setTopK,
  topP, setTopP,
  frequencyPenalty, setFrequencyPenalty,
  presencePenalty, setPresencePenalty,
  maxTokens, setMaxTokens,
  returnImages, setReturnImages,
  returnRelatedQuestions, setReturnRelatedQuestions,
  searchRecency, setSearchRecency
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <InputField
            icon="🎯"
            label="Top-K"
            type="range"
            min="0"
            max="2048"
            step="1"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
          />
        </div>
        <div className="card">
          <InputField
            icon="🎲"
            label="Top-P"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <InputField
            icon="📊"
            label="Frequency Penalty"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={frequencyPenalty}
            onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
          />
        </div>
        <div className="card">
          <InputField
            icon="🔄"
            label="Presence Penalty"
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={presencePenalty}
            onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <InputField
            icon="📝"
            label="Max Tokens"
            type="number"
            min="1"
            max="4096"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          />
        </div>
        <div className="card">
          <InputField
            icon="⏰"
            label="검색 기간"
            type="select"
            value={searchRecency}
            onChange={(e) => setSearchRecency(e.target.value)}
            options={SEARCH_RECENCY_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <InputField
            icon="🖼️"
            label="이미지 반환"
            type="checkbox"
            checked={returnImages}
            onChange={(e) => setReturnImages(e.target.checked)}
          />
        </div>
        <div className="card">
          <InputField
            icon="❓"
            label="관련 질문 반환"
            type="checkbox"
            checked={returnRelatedQuestions}
            onChange={(e) => setReturnRelatedQuestions(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}; 