# JNAS AI Chat Framework Specification (Sprint 4)

This document provides architectural schematics, data-flow trees, component guides, and future integration specifications for the **Enterprise AI Chat Framework** implemented in Sprint 4.

---

## 1. Directory & File Structure Map

The entire chat framework is modularized under the following node configurations to maintain clean separation of concerns and robust compilations:

```text
/src
├── types/
│   └── chat.ts                  # Shared type contracts & settings interfaces
├── data/
│   └── chatMockData.ts          # Pre-populated conversation threads & prompt templates
├── components/
│   └── chat/
│       ├── ChatSidebar.tsx      # Channel searches, categories, pins, star lists
│       ├── ChatMessageList.tsx  # Dynamic Markdown parser, copyable code blocks & bubbles
│       ├── ChatPromptEditor.tsx # Input box with character counters & file manager
│       ├── ChatStatusPanel.tsx  # AI Core telemetry tracking & state monitors
│       ├── ChatPromptLibrary.tsx# Multi-category prompt lookup overlays
│       └── ChatSettingsDialog.tsx# Model parameter modifiers & archive backups
└── pages/
    └── AICorePage.tsx           # Page coordinator with responsive layouts & states
```

---

## 2. Core Conversation Flow & Data Pipelines

The flow of interactive operations between the user inputs, layout components, and future model backends is strictly coordinated client-side:

```text
[Operator Prompt] ➔ [ChatPromptEditor (Auto-resizes & tokenizes)]
                        │
                        ▼ (Sends message + attachments)
            [AICorePage State Engine]
              ├── Appends user message block
              ├── Dispatches "loading" bubble for cognitive reflection
              └── Triggers simulated pipeline streams
                        │
                        ▼ (Simulated execution dispatch)
       [ChatMessageList: User & Assistant Bubble Rendering]
              ├── FormattedContent (Renders markdown list nodes)
              ├── Custom code blocks with clipboard buffers
              └── Collapsible Tool Execution status blocks
                        │
                        ▼
            [ChatStatusPanel Telemetry Board]
              ├── Updates context capacity size tracker
              └── Logs Speed (tkn/sec) and latency trace
```

---

## 3. Modular Component Guide

### `types/chat.ts`
Establishes runtime contracts for all chat pipelines. Declares definitions like `ConversationCategory` ('General' | 'Programming' | 'Engineering' | 'Packaging' | 'Business' | 'Documentation' | 'Personal'), `AttachmentType` ('pdf' | 'doc' | 'xls' | 'img' | 'cad' | 'zip' | 'md' | 'audio' | 'video'), and message structures containing statuses like `'done' | 'streaming' | 'warning' | 'error' | 'loading'`.

### `ChatSidebar.tsx`
Handles search lookups across conversation titles, tags, and active projects. Features collapsible tabs grouping active versus archived threads, filter sliders by category type, and action triggers to pin, star, rename, or delete items.

### `ChatMessageList.tsx`
Provides reusable message bubbles with specific styles for System clearance logs, User actions, Assistant reflections, Tool reports, Warnings, and Errors. Integrates a custom inline markdown syntax tokenizer to format bullets, **bold headers**, and inline code segments without external package burdens.

### `ChatPromptEditor.tsx`
Features an auto-resizing input textarea (max 240px height) equipped with live character counts and token weight estimation ratios. Supports multi-line inputs with keyboard modifier overrides (`Enter` to submit, `Shift+Enter` to insert newline) and hosts drag-and-drop simulated file attachment triggers.

### `ChatStatusPanel.tsx`
A high-contrast telemetry board monitoring active model provider configurations, current context size capacity loads, and response performance values. Features placeholder panels displaying mock connection states for the Memory Engine, RAG databases, and Agent nodes.

### `ChatPromptLibrary.tsx`
Lists categorised quick-start templates (tabs: Engineering, Programming, Business, Documentation, etc.) allowing users to immediately copy blueprints or load prompts directly into the composer.

---

## 4. Developer Guide: Connecting Future AI Providers

When integrating live LLM provider nodes in Sprint 5, follow these steps to keep the interface highly stable and scalable:

### Step A: Configure Server Proxy Routes
Always implement API integrations on the Express server (`/server.ts`) to avoid exposing API keys to the browser. Avoid client-side SDK instantiations.

```typescript
// server.ts (Sprint 5 live provider proxy example)
import { GoogleGenAI } from "@google/genai";

app.post('/api/ai/chat', async (req, res) => {
  const { messages, provider, temperature } = req.body;
  
  if (provider.includes('Gemini')) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: { temperature }
    });
    return res.json({ text: response.text });
  }
  // Implement OpenAI, Ollama, or Anthropic routing equivalents...
});
```

### Step B: Hook AICorePage to the Server Endpoint
Replace the simulated response timing logic in `/src/pages/AICorePage.tsx` with a standard `fetch` call pointing to your `/api/ai/chat` proxy.

```typescript
// src/pages/AICorePage.tsx - Integration Bridge
const dispatchLivePrompt = async (userInput: string) => {
  // 1. Set assistant loading state bubble
  // 2. Fetch server API
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...activeChat.messages, { role: 'user', content: userInput }],
      provider: chatSettings.defaultProvider,
      temperature: chatSettings.temperature
    })
  });
  const data = await response.json();
  // 3. Append data.text to activeChat messages and set status to 'done'
};
```

---

## 5. Intentionally Excluded Architectures (Sprint 4 Scope Limits)

In strict adherence to Sprint 4 boundaries:
1. **No External API or Local Model Calls**: Zero active fetch requests or package instantiations pointing to Gemini, OpenAI, or Ollama occur.
2. **No RAG or Vector Database Connections**: Knowledge engines and document processors are represented visually only; uploaded mock file data remains offline inside client memory.
3. **No Database Persistence Layer**: Persistent records rely on client-side state hooks synchronized with browser `localStorage`.
