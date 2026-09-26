export type ChatRole = 'user' | 'assistant';

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'spreadsheet' | string;
  size: number;
  url?: string;
  previewUrl?: string;
  extractedText?: string;
  ocrConfidence?: number;
  pageCount?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: AttachmentItem[];
  timestamp?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
  archived?: boolean;
}
