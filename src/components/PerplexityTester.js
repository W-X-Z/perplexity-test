import { useState, useEffect } from "react";
import { callPerplexityApi } from '../api/perplexityApi.js';
import { InputField } from './common/InputField.js';
import { LoadingSpinner } from './common/LoadingSpinner.js';
import { Toast } from './common/Toast.js';
import { useToast } from '../hooks/useToast.js';
import { MODELS, DEFAULT_VALUES } from '../constants/index.js';
import { ResponseSection } from './common/ResponseSection.js';
import { AdvancedSettings } from './common/AdvancedSettings.js';

export default function PerplexityTester() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [systemPrompt, setSystemPrompt] = useState("You are an expert in global stock market. **Always answer in Korean**");
  const [userPrompt, setUserPrompt] = useState("Provide a brief introduction of stock TSLA | NYSE | 테슬라");
  const [model, setModel] = useState("sonar");
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_VALUES.MAX_TOKENS);
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
  const [chatHistories, setChatHistories] = useState(() => {
    const saved = localStorage.getItem('chatHistories');
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: formatDate(new Date()),
      messages: [],
      createdAt: new Date().toISOString()
    }];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    return chatHistories[0]?.id || 'default';
  });

  const currentChat = chatHistories.find(chat => chat.id === currentChatId) || chatHistories[0];

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
  }, [chatHistories]);

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

      console.log('API 원본 응답:', JSON.stringify(data, null, 2));

      if (!data) {
        throw new Error('API 응답이 없습니다');
      }

      if (!data.choices?.[0]?.message?.content || data.choices[0]?.finish_reason === 'length') {
        console.warn('응답이 잘리거나 비어있습니다:', data.choices[0]?.finish_reason);
        const fallbackResponse = data.choices?.[0]?.message?.content || 
          (data.citations?.length > 0 
            ? `참고 자료를 확인해주세요: ${data.citations[0]}`
            : '응답을 생성하지 못했습니다. 다시 시도해주세요.');

        const newMessage = {
          id: Date.now(),
          userPrompt,
          response: fallbackResponse,
          citations: data.citations || [],
          timestamp: new Date().toISOString(),
          relatedQuestions: data.related_questions || [],
          images: data.images || []
        };

        setChatHistories(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        }));

        setResponse(fallbackResponse);
        setCitations(data.citations || []);
        showToast('warning', '응답이 비어있습니다. 다시 시도해주세요.');
      } else {
        const newMessage = {
          id: Date.now(),
          userPrompt,
          response: data.choices[0].message.content,
          citations: data.citations || [],
          timestamp: new Date().toISOString(),
          relatedQuestions: data.related_questions || [],
          images: data.images || []
        };

        setChatHistories(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage]
            };
          }
          return chat;
        }));

        setResponse(data.choices[0].message.content);
        setCitations(data.citations || []);
      }
      
      setUserPrompt('');
    } catch (error) {
      console.error('API 오류:', error);
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    
    if (targetDate.toDateString() === now.toDateString()) {
      return `오늘 ${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (targetDate.toDateString() === yesterday.toDateString()) {
      return `어제 ${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return `${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일 ${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      name: formatDate(new Date()),
      messages: [],
      createdAt: new Date().toISOString()
    };
    setChatHistories(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setUserPrompt('');
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
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

          {/* 채팅 선택 드롭다운과 새 채팅 버튼 */}
          <div className="flex items-center justify-between mb-6">
            <select 
              value={currentChatId}
              onChange={(e) => selectChat(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white"
            >
              {chatHistories
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(chat => (
                  <option key={chat.id} value={chat.id}>
                    {chat.name} {chat.messages.length > 0 ? `(${chat.messages.length})` : ''}
                  </option>
                ))}
            </select>
            
            <button
              onClick={createNewChat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>새 채팅</span>
              <span>+</span>
            </button>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-6 h-full">
            {currentChat.messages.map((chat) => (
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
                  
                  {/* 이미지 영역 추가 */}
                  {chat.images?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">이미지</p>
                      <div className="grid grid-cols-2 gap-4">
                        {chat.images.map((image, index) => {
                          console.log('이미지 데이터:', image);
                          return (
                            <div key={index} className="relative aspect-video">
                              <img
                                src={image.url || image.image_url || image}
                                alt={image.title || image.alt || '생성된 이미지'}
                                className="rounded-lg object-cover w-full h-full"
                                onError={(e) => {
                                  console.error('이미지 로드 실패:', e);
                                  e.target.src = 'fallback-image-url';
                                }}
                              />
                              {image.title && (
                                <p className="text-xs text-gray-500 mt-1">{image.title}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
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
