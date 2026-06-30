export type ConversationCategory = 'General' | 'Programming' | 'Engineering' | 'Packaging' | 'Business' | 'Documentation' | 'Personal';

export type ConversationStatus = 'active' | 'archived';

export type AttachmentType = 'pdf' | 'doc' | 'xls' | 'img' | 'cad' | 'zip' | 'md' | 'audio' | 'video';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  status?: 'done' | 'streaming' | 'warning' | 'error' | 'loading';
  toolName?: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  pinned: boolean;
  category: ConversationCategory;
  project?: string;
  workspace: string;
  tags: string[];
  status: ConversationStatus;
  messages: Message[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: ConversationCategory;
  favorite: boolean;
}

export interface ChatSettings {
  defaultProvider: string;
  temperature: number; // 0.0 - 2.0
  responseStyle: 'concise' | 'balanced' | 'detailed' | 'creative';
  theme: 'system' | 'dark' | 'light';
  privacyMode: boolean;
  maxTokens: number;
  safetyLevel: 'none' | 'block_low_above' | 'block_medium_above' | 'block_high_above';
  streaming: boolean;
  retryCount: number;
  timeout: number;
}
