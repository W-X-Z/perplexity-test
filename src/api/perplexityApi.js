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

  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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

    // 직접 API 호출 시도
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        return response.json();
      }
    } catch (directError) {
      console.log('직접 API 호출 실패, 프록시 시도:', directError);
    }

    // 프록시를 통한 호출 시도
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_URL);
    const proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!proxyResponse.ok) {
      throw new Error(`API 호출 실패: ${proxyResponse.status}`);
    }

    return proxyResponse.json();
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    throw error;
  }
}; 