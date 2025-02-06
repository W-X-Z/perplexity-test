import { API_URL } from '../constants';

export const callPerplexityApi = async ({
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
}) => {
  if (!apiKey) {
    throw new Error('API Key가 필요합니다');
  }

  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  };

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    search_recency_filter: searchRecency,
    return_images: returnImages,
    return_related_questions: returnRelatedQuestions
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status}`);
  }

  return response.json();
}; 