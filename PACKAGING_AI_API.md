# Packaging AI Assistant API Endpoints

## 1. Chat Execution Endpoint (Non-Streaming)
- **Endpoint**: `POST /api/ai/chat`
- **Payload**:
```json
{
  "providerId": "gemini",
  "messages": [
    { "role": "user", "content": "What is the recommended cushion thickness for an 80kg payload?" }
  ],
  "temperature": 0.4,
  "maxTokens": 2048,
  "systemInstruction": "You are a senior mechanical packaging engineer..."
}
```
- **Response**:
```json
{
  "success": true,
  "response": {
    "text": "Based on MIL-HDBK-304C, for high-density polyethylene foams, a 50mm-75mm thickness is ideal..."
  }
}
```

## 2. Server-Sent Events Chat Streaming (SSE)
- **Endpoint**: `POST /api/ai/chat/stream`
- **Payload**: Same as above.
- **Protocol**: `text/event-stream` returning incremental text chunks, concluding with `{ "done": true }`.
