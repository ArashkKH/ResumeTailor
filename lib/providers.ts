export type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'groq';

export interface ModelOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  free?: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  keyLabel: string;
  keyPlaceholder: string;
  keyUrl: string;
  keyUrlLabel: string;
  models: ModelOption[];
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'gemini',
    label: 'Gemini',
    keyLabel: 'Google AI Studio Key',
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyUrlLabel: 'aistudio.google.com',
    models: [
      {
        id: 'gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        shortLabel: 'Flash 2.0',
        description: 'Fast and capable · Free tier available',
        free: true,
      },
      {
        id: 'gemini-1.5-pro',
        label: 'Gemini 1.5 Pro',
        shortLabel: '1.5 Pro',
        description: 'High quality reasoning',
      },
    ],
  },
  {
    id: 'groq',
    label: 'Groq',
    keyLabel: 'Groq API Key',
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyUrlLabel: 'console.groq.com/keys',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        label: 'Llama 3.3 70B',
        shortLabel: 'Llama 3.3',
        description: 'Powerful open-source model · Free tier',
        free: true,
      },
      {
        id: 'mixtral-8x7b-32768',
        label: 'Mixtral 8x7B',
        shortLabel: 'Mixtral 8x7B',
        description: 'Efficient mixture-of-experts · Free tier',
        free: true,
      },
    ],
  },
  {
    id: 'anthropic',
    label: 'Claude',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-api03-...',
    keyUrl: 'https://console.anthropic.com/keys',
    keyUrlLabel: 'console.anthropic.com/keys',
    models: [
      {
        id: 'claude-sonnet-4-6',
        label: 'Claude Sonnet 4.6',
        shortLabel: 'Sonnet 4.6',
        description: 'Best quality, balanced speed',
      },
      {
        id: 'claude-haiku-4-5-20251001',
        label: 'Claude Haiku 4.5',
        shortLabel: 'Haiku 4.5',
        description: 'Fastest, most economical',
      },
    ],
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyUrlLabel: 'platform.openai.com/api-keys',
    models: [
      {
        id: 'gpt-4o',
        label: 'GPT-4o',
        shortLabel: 'GPT-4o',
        description: 'Most capable OpenAI model',
      },
      {
        id: 'gpt-4o-mini',
        label: 'GPT-4o mini',
        shortLabel: '4o mini',
        description: 'Faster and more economical',
      },
    ],
  },
];

export const DEFAULT_PROVIDER: ProviderId = 'gemini';

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
};

export function getProvider(id: ProviderId): ProviderConfig {
  return PROVIDERS.find(p => p.id === id)!;
}

export function getModel(providerId: ProviderId, modelId: string): ModelOption {
  const provider = getProvider(providerId);
  return provider.models.find(m => m.id === modelId) ?? provider.models[0];
}
