import { useState, useEffect } from "react";
import { callPerplexityApi } from '../api/perplexityApi';
import { InputField } from './common/InputField';
import { LoadingSpinner } from './common/LoadingSpinner';
import { Toast } from './common/Toast';
import { useToast } from '../hooks/useToast';
import { MODELS, DEFAULT_VALUES } from '../constants';
import { ResponseSection } from './common/ResponseSection';
import { AdvancedSettings } from './common/AdvancedSettings';

export default function PerplexityTester() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [systemPrompt, setSystemPrompt] = useState("You are an expert in global stock market. **Always answer in Korean**");
  const [userPrompt, setUserPrompt] = useState("Provide a brief introduction of stock TSLA | NYSE | 테슬라");
  const [model, setModel] = useState("sonar");
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(200);
  const [topP, setTopP] = useState(0.9);
  const [frequencyPenalty, setFrequencyPenalty] = useState(1.0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [response, setResponse] = useState("");
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(DEFAULT_VALUES.TOP_K);
  const [returnImages, setReturnImages] = useState(DEFAULT_VALUES.RETURN_IMAGES);
  const [returnRelatedQuestions, setReturnRelatedQuestions] = useState(DEFAULT_VALUES.RETURN_RELATED_QUESTIONS);
  const [searchRecency, setSearchRecency] = useState(DEFAULT_VALUES.SEARCH_RECENCY);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResponse('');
      setCitations([]);

      const data = await callPerplexityApi({
        apiKey,
        model,
        systemPrompt,
        userPrompt,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        searchRecency,
        returnImages,
        returnRelatedQuestions
      });

      const newMessage = {
        id: Date.now(),
        userPrompt,
        response: data?.choices?.[0]?.message?.content || '응답이 없습니다.',
        citations: data?.citations || [],
        timestamp: new Date().toISOString(),
        relatedQuestions: data?.related_questions || [],
        images: data?.images || []
      };

      setChatHistory(prev => [...prev, newMessage]);
      setResponse(newMessage.response);
      setCitations(newMessage.citations);
      setUserPrompt('');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex h-full">
        {/* 좌측: 채팅 UI */}
        <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
          <header className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perplexity API 테스터
            </h1>
          </header>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-6 h-full">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">User</p>
                  <p className="text-gray-700">{chat.userPrompt}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Assistant</p>
                  <div className="prose prose-sm">
                    {chat.response}
                  </div>
                  
                  {/* 관련 질문 영역 추가 */}
                  {chat.relatedQuestions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">관련 질문</p>
                      <div className="flex flex-wrap gap-2">
                        {chat.relatedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setUserPrompt(question);
                              // 입력창으로 스크롤
                              document.querySelector('textarea')?.focus();
                            }}
                            className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 기존 Citations 영역 */}
                  {chat.citations?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Citations</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {chat.citations.map((citation, index) => (
                          <li key={index}>{citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 입력 영역 */}
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <textarea
                className="w-full min-h-[100px] p-4 pr-20 text-gray-700 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="메시지를 입력하세요..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="absolute bottom-4 right-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <span>전송</span>
                    <span className="text-xl">➤</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 text-right">
              Shift + Enter로 줄바꿈, Enter로 전송
            </p>
          </div>
        </div>

        {/* 우측: 설정 UI */}
        <div className="w-[400px] p-6 bg-gray-50 overflow-y-auto">
          <div className="space-y-6">
            {/* API Key 입력 */}
            <InputField
              icon="🔑"
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />

            {/* 시스템 프롬프트 */}
            <InputField
              icon="⚙️"
              label="시스템 프롬프트"
              type="textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />

            {/* 모델 선택 */}
            <InputField
              icon="🤖"
              label="모델"
              type="select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              options={[
                { value: "sonar", label: "Sonar" },
                { value: "sonar-pro", label: "Sonar Pro" },
                { value: "sonar-reasoning", label: "Sonar Reasoning" },
              ]}
            />

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">모델 설정</h3>
              
              <InputField
                icon="🌡️"
                label="Temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />

              <InputField
                icon="📝"
                label="Max Tokens"
                type="range"
                min="1"
                max="4096"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              />

              <InputField
                icon="🎯"
                label="Top P"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
              />

              <InputField
                icon="🔄"
                label="Frequency Penalty"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={frequencyPenalty}
                onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
              />

              <InputField
                icon="⚖️"
                label="Presence Penalty"
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={presencePenalty}
                onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">검색 설정</h3>
              
              <InputField
                icon="⏰"
                label="정보 기간"
                type="select"
                value={searchRecency}
                onChange={(e) => setSearchRecency(e.target.value)}
                options={[
                  { value: "month", label: "1개월" },
                  { value: "week", label: "1주일" },
                  { value: "day", label: "1일" },
                  { value: "hour", label: "1시간" }
                ]}
              />

              <div className="flex items-center space-x-4">
                <InputField
                  icon="🖼️"
                  label="이미지 반환"
                  type="checkbox"
                  checked={returnImages}
                  onChange={(e) => setReturnImages(e.target.checked)}
                />
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
        </div>
      </div>
    </div>
  );
}
