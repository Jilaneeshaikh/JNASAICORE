import { Conversation, Message } from '../types/chat';

export class ConversationManager {
  /**
   * Validates a conversation thread payload for integrity.
   */
  validate(conv: any): Conversation {
    if (!conv || typeof conv !== 'object') {
      throw new Error('Invalid conversation payload: Must be an object.');
    }
    if (!conv.id || typeof conv.id !== 'string') {
      throw new Error('Invalid conversation integrity: "id" string is required.');
    }
    if (!conv.title || typeof conv.title !== 'string') {
      throw new Error('Invalid conversation integrity: "title" string is required.');
    }
    if (!conv.messages || !Array.isArray(conv.messages)) {
      throw new Error('Invalid conversation integrity: "messages" array is required.');
    }

    // Ensure status bounds
    const status: 'active' | 'archived' = conv.status === 'archived' ? 'archived' : 'active';

    // Validate and clean individual messages
    const messages: Message[] = conv.messages.map((m: any, idx: number) => {
      if (!m.id || typeof m.id !== 'string') m.id = `msg-${Date.now()}-${idx}`;
      if (!m.role || !['user', 'assistant', 'system', 'tool'].includes(m.role)) {
        m.role = 'user';
      }
      if (typeof m.content !== 'string') m.content = String(m.content || '');
      if (!m.timestamp) m.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        status: m.status || 'done',
        toolName: m.toolName,
        attachments: m.attachments
      };
    });

    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt || new Date().toISOString(),
      updatedAt: conv.updatedAt || new Date().toISOString(),
      favorite: !!conv.favorite,
      pinned: !!conv.pinned,
      category: conv.category || 'General',
      project: conv.project || 'JNAS Sandbox Pipeline',
      workspace: conv.workspace || 'personal',
      tags: Array.isArray(conv.tags) ? conv.tags.map(String) : [],
      status,
      messages
    };
  }

  /**
   * Sorts conversations by pinned status first, then by updatedAt.
   */
  sort(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  /**
   * Compiles conversations into an exportable backup archive.
   */
  exportArchive(conversations: Conversation[]): string {
    const archive = {
      version: 'JNAS-THREAD-BACKUP-v1.0',
      exportedAt: new Date().toISOString(),
      totalThreads: conversations.length,
      threads: conversations.map(c => this.validate(c))
    };
    return JSON.stringify(archive, null, 2);
  }

  /**
   * Parses and imports threads from an external backup archive.
   */
  importArchive(rawJson: string): Conversation[] {
    try {
      const data = JSON.parse(rawJson);
      let threadsToParse: any[] = [];

      if (Array.isArray(data)) {
        threadsToParse = data;
      } else if (data && Array.isArray(data.threads)) {
        threadsToParse = data.threads;
      } else {
        throw new Error('Invalid archive format: Could not locate a valid conversation array.');
      }

      return threadsToParse.map(t => this.validate(t));
    } catch (err: any) {
      throw new Error(`Archive restoration failed: ${err.message}`);
    }
  }
}

export const conversationManager = new ConversationManager();
