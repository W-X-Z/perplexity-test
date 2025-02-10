export const API_URL = 'https://api.perplexity.ai/chat/completions';

export const MODELS = {
  SONAR: 'sonar',
  SONAR_PRO: 'sonar-pro',
  SONAR_REASONING: 'sonar-reasoning'
};

export const DEFAULT_VALUES = {
  TEMPERATURE: 0.2,
  MAX_TOKENS: 2000,
  TOP_P: 0.9,
  TOP_K: 0,
  FREQUENCY_PENALTY: 1.0,
  PRESENCE_PENALTY: 0,
  RETURN_IMAGES: false,
  RETURN_RELATED_QUESTIONS: false,
  SEARCH_RECENCY: 'month'
};

export const SEARCH_RECENCY_OPTIONS = [
  { value: 'month', label: '1개월' },
  { value: 'week', label: '1주일' },
  { value: 'day', label: '1일' },
  { value: 'hour', label: '1시간' }
]; 