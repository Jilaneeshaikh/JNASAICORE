import { ContextBuilderConfig, UnifiedContextPayload, RetrievalResult } from './types';
import { retrieveChunks } from './retrieval';
import { registry as kmsRegistry } from '../knowledge/registry';

export function buildUnifiedContext(
  query: string,
  workspace: string,
  config: ContextBuilderConfig
): UnifiedContextPayload {
  const sources: UnifiedContextPayload['sources'] = [];
  let contextString = `======================================================================\n`;
  contextString += `JNAS SECURE ENTERPRISE UNIFIED CONTEXT BARRIER\n`;
  contextString += `GENERATED ON: ${new Date().toISOString()}\n`;
  contextString += `WORKSPACE ISOLATION CODE: ${workspace.toUpperCase()}\n`;
  contextString += `SECURITY CLASSIFICATION: ROLE-RESTRICTED INTEGRITY CHECK\n`;
  contextString += `======================================================================\n\n`;

  // 1. Gather Documents and Chunks (RAG Retrieval)
  if (config.includeDocuments && query) {
    contextString += `--- CONTEXT DIVISION ALPHA: DOCUMENT CHUNKS (RAG) ---\n`;
    const documentResults = retrieveChunks({
      text: query,
      workspace,
      limit: 3
    });

    if (documentResults.length > 0) {
      documentResults.forEach((res, i) => {
        const indexId = `doc-source-${i + 1}`;
        contextString += `[SOURCE ${indexId}] (Relevance: ${Math.round(res.relevanceScore * 100)}%)\n`;
        contextString += `Title: ${res.documentTitle} [Format: ${res.documentFormat.toUpperCase()}]\n`;
        contextString += `Segment: ${res.chunk.metadata.title} (Page ${res.chunk.metadata.pageNumber || 1})\n`;
        contextString += `Content:\n"${res.chunk.content.trim()}"\n\n`;

        sources.push({
          type: 'document',
          id: res.chunk.documentId,
          title: res.documentTitle,
          referenceUrl: `#/${workspace}/docs/${res.chunk.documentId}`
        });
      });
    } else {
      contextString += `[No matching document segments retrieved for isolation boundary]\n\n`;
    }
  }

  // 2. Gather KMS Knowledge Nodes
  if (config.includeKnowledge) {
    contextString += `--- CONTEXT DIVISION BETA: KMS KNOWLEDGE OBJECTS ---\n`;
    const kmsResults = kmsRegistry.query({
      keyword: query || undefined,
      workspace
    }).slice(0, 2);

    if (kmsResults.length > 0) {
      kmsResults.forEach((obj, i) => {
        const indexId = `kms-source-${i + 1}`;
        contextString += `[SOURCE ${indexId}]\n`;
        contextString += `Title: ${obj.title}\n`;
        contextString += `Category: ${obj.category} | Type: ${obj.type}\n`;
        contextString += `Summary: ${obj.description}\n\n`;

        sources.push({
          type: 'knowledge',
          id: obj.id,
          title: obj.title,
          referenceUrl: `#/${workspace}/kms/${obj.id}`
        });
      });
    } else {
      // Fallback: list top knowledge objects in this workspace if search yielded empty list
      const fallbackKms = kmsRegistry.getObjects()
        .filter(obj => obj.workspace === workspace)
        .slice(0, 2);

      if (fallbackKms.length > 0) {
        fallbackKms.forEach((obj, i) => {
          const indexId = `kms-source-${i + 1}`;
          contextString += `[SOURCE ${indexId}]\n`;
          contextString += `Title: ${obj.title}\n`;
          contextString += `Category: ${obj.category}\n`;
          contextString += `Summary: ${obj.description}\n\n`;

          sources.push({
            type: 'knowledge',
            id: obj.id,
            title: obj.title,
          });
        });
      } else {
        contextString += `[No active KMS knowledge nodes registered in active workspace]\n\n`;
      }
    }
  }

  // 3. Gather Enterprise Memory Core Recalls
  if (config.includeMemory) {
    contextString += `--- CONTEXT DIVISION GAMMA: ENTERPRISE MEMORY CORE RECALLS ---\n`;
    // Simulated core memory recall related to workspace and query terms
    const memories = [
      {
        id: 'mem-102',
        title: 'Aerospace Engineering Safety Guidelines (Q1 Update)',
        content: 'Recall indicates JNAS team requires all telemetry variables to strictly align with AS9100 standard requirements.'
      },
      {
        id: 'mem-115',
        title: 'Workspace Operator Preference Node',
        content: 'Operator prefers low-latency stream models for active drafting procedures.'
      }
    ];

    const matchingMemories = query 
      ? memories.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.content.toLowerCase().includes(query.toLowerCase()))
      : memories;

    if (matchingMemories.length > 0) {
      matchingMemories.forEach((mem, i) => {
        const indexId = `mem-source-${i + 1}`;
        contextString += `[SOURCE ${indexId}]\n`;
        contextString += `Memory Node: ${mem.title}\n`;
        contextString += `Recall Content: "${mem.content}"\n\n`;

        sources.push({
          type: 'memory',
          id: mem.id,
          title: mem.title
        });
      });
    } else {
      contextString += `[No high-resonance memories matched query vectors]\n\n`;
    }
  }

  // 4. Gather Universal Search Hits
  if (config.includeSearchResults) {
    contextString += `--- CONTEXT DIVISION DELTA: CROSS-MODULE SEARCH TARGETS ---\n`;
    // Simulated search hits
    const mockSearchHits = [
      { id: 'search-304', title: 'Aerospace Wing Deflection Simulation', module: 'Engineering', workspace },
      { id: 'search-102', title: 'Active CRM Customer: Boeing Aerospace Co.', module: 'CRM', workspace }
    ];

    const hits = query
      ? mockSearchHits.filter(h => h.title.toLowerCase().includes(query.toLowerCase()))
      : mockSearchHits;

    if (hits.length > 0) {
      hits.forEach((hit, i) => {
        const indexId = `search-source-${i + 1}`;
        contextString += `[SOURCE ${indexId}]\n`;
        contextString += `Module: ${hit.module} | Title: ${hit.title}\n`;
        contextString += `Location Path: ${hit.workspace}/${hit.module.toLowerCase()}/records\n\n`;

        sources.push({
          type: 'search',
          id: hit.id,
          title: hit.title
        });
      });
    } else {
      contextString += `[Universal Search indices report zero matches for current string]\n\n`;
    }
  }

  contextString += `======================================================================\n`;
  contextString += `END UNIFIED CONTEXT BARRIER. AUTHORIZATION CODE: JNAS-RAG-GATEWAY-V4\n`;
  contextString += `======================================================================`;

  // Estimate tokens: 1 token ~= 4 characters on average
  const estimatedTokens = Math.round(contextString.length / 4);

  return {
    contextString,
    tokenCount: estimatedTokens,
    sources
  };
}
