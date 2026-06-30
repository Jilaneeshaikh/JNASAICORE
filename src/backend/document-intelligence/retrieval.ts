import { RetrievalQuery, RetrievalResult, DocumentChunk } from './types';
import { documentRegistry } from './documentRegistry';

export function retrieveChunks(query: RetrievalQuery): RetrievalResult[] {
  const documents = documentRegistry.getDocuments();
  const allResults: RetrievalResult[] = [];

  // Filter valid documents based on metadata parameters (Security, Workspace, Project, Module, etc.)
  const allowedDocs = documents.filter((doc) => {
    // 1. Workspace Isolation is a strictly enforced barrier
    if (doc.workspace !== query.workspace) return false;

    // 2. Project Isolation (Optional filter)
    if (query.project && doc.project !== query.project) return false;

    // 3. Module Filter (Optional filter)
    if (query.module && doc.module !== query.module) return false;

    // 4. Category Filter (Optional filter)
    if (query.categories && query.categories.length > 0 && !query.categories.includes(doc.category)) {
      return false;
    }

    // 5. Tags Filter (Optional filter)
    if (query.tags && query.tags.length > 0) {
      const docTags = doc.tags.map(t => t.toLowerCase());
      const hasMatchingTag = query.tags.some(t => docTags.includes(t.toLowerCase()));
      if (!hasMatchingTag) return false;
    }

    // 6. Security Classification clearances
    if (query.classification && query.classification.length > 0) {
      if (!query.classification.includes(doc.classification)) return false;
    }

    return doc.status === 'indexed';
  });

  // Query each allowed document's chunks
  for (const doc of allowedDocs) {
    const chunks = documentRegistry.getChunksForDocument(doc.id);
    for (const chunk of chunks) {
      let score = 0.5; // Baseline overlap score

      // If text query is provided, calculate basic word-overlap score
      if (query.text) {
        const qWords = query.text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const chunkLower = chunk.content.toLowerCase();
        let matches = 0;

        for (const word of qWords) {
          if (chunkLower.includes(word)) {
            matches++;
            // Reward exact keyword match proximity
            score += 0.15;
          }
        }

        // Boost score if keyword matches title or section headers
        const titleLower = chunk.metadata.title.toLowerCase();
        for (const word of qWords) {
          if (titleLower.includes(word)) {
            score += 0.25;
          }
        }

        if (matches === 0) {
          // If a query text is specified and no words match, skip this chunk
          continue;
        }
      }

      // Cap score between 0.0 and 1.0
      score = Math.min(Math.max(score, 0.1), 0.99);

      allResults.push({
        chunk,
        relevanceScore: parseFloat(score.toFixed(3)),
        documentTitle: doc.title,
        documentFormat: doc.format,
      });
    }
  }

  // Sort by relevance score descending
  allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Return limited result set
  const limit = query.limit || 5;
  const slicedResults = allResults.slice(0, limit);

  // Log retrieval in registry auditing
  if (slicedResults.length > 0 && query.text) {
    documentRegistry.addAuditLog(
      'operator',
      'retrieve',
      slicedResults[0].chunk.documentId,
      query.workspace,
      'success',
      `Executed semantic retrieval retrieval query: "${query.text}". Returned ${slicedResults.length} matching segments with top score ${slicedResults[0].relevanceScore}.`
    );
  }

  return slicedResults;
}
