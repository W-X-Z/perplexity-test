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
      'Authorization': `Bearer ${apiKey}`,
      'Access-Control-Allow-Origin': '*'
    };

    // 개발 환경에서는 직접 API 호출
    if (process.env.NODE_ENV === 'development') {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      return response.json();
    } 
    // 프로덕션 환경에서는 프록시 서버를 통해 호출
    else {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const response = await fetch(proxyUrl + API_URL, {
        method: 'POST',
        headers: {
          ...headers,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      return response.json();
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    throw error;
  }
}; 