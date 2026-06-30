import {
  KnowledgeSource,
  KnowledgeObject,
  KnowledgeRelationship,
  KnowledgeSearchQuery,
} from './types';

export class KnowledgeRegistry {
  private static instance: KnowledgeRegistry;
  private sources: Map<string, KnowledgeSource> = new Map();
  private objects: Map<string, KnowledgeObject> = new Map();
  private relationships: KnowledgeRelationship[] = [];

  private constructor() {}

  public static getInstance(): KnowledgeRegistry {
    if (!KnowledgeRegistry.instance) {
      KnowledgeRegistry.instance = new KnowledgeRegistry();
    }
    return KnowledgeRegistry.instance;
  }

  // Source Registration
  public registerSource(source: KnowledgeSource): void {
    this.sources.set(source.id, source);
    console.log(`[KnowledgeRegistry] Registered source: ${source.name} (Module: ${source.ownerModule})`);
  }

  public getSources(): KnowledgeSource[] {
    return Array.from(this.sources.values());
  }

  public getSourceById(id: string): KnowledgeSource | undefined {
    return this.sources.get(id);
  }

  // Knowledge Object Registry
  public registerObject(obj: KnowledgeObject): void {
    this.objects.set(obj.id, obj);
  }

  public getObjects(): KnowledgeObject[] {
    return Array.from(this.objects.values());
  }

  public getObjectById(id: string): KnowledgeObject | undefined {
    return this.objects.get(id);
  }

  // Relationship Management
  public registerRelationship(relation: KnowledgeRelationship): void {
    this.relationships.push(relation);
  }

  public getRelationshipsForObject(objectId: string): KnowledgeRelationship[] {
    return this.relationships.filter(
      (r) => r.sourceId === objectId || r.targetId === objectId
    );
  }

  public getRelatedObjects(objectId: string): { relation: KnowledgeRelationship; object: KnowledgeObject }[] {
    const relations = this.getRelationshipsForObject(objectId);
    const related: { relation: KnowledgeRelationship; object: KnowledgeObject }[] = [];

    for (const rel of relations) {
      const otherId = rel.sourceId === objectId ? rel.targetId : rel.sourceId;
      const otherObj = this.getObjectById(otherId);
      if (otherObj) {
        related.push({ relation: rel, object: otherObj });
      }
    }

    return related;
  }

  // Search/Query Execution (Foundation for future Semantic/RAG indexer)
  public query(query: KnowledgeSearchQuery): KnowledgeObject[] {
    let results = Array.from(this.objects.values());

    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      results = results.filter(
        (obj) =>
          obj.title.toLowerCase().includes(kw) ||
          obj.description.toLowerCase().includes(kw) ||
          obj.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    if (query.categories && query.categories.length > 0) {
      results = results.filter((obj) => query.categories!.includes(obj.category));
    }

    if (query.types && query.types.length > 0) {
      results = results.filter((obj) => query.types!.includes(obj.type));
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((obj) =>
        query.tags!.every((t) => obj.tags.includes(t))
      );
    }

    if (query.project) {
      results = results.filter((obj) => obj.project === query.project);
    }

    if (query.owner) {
      results = results.filter((obj) => obj.owner === query.owner);
    }

    if (query.workspace) {
      results = results.filter((obj) => obj.workspace === query.workspace);
    }

    if (query.visibility) {
      results = results.filter((obj) => obj.permissions.visibility === query.visibility);
    }

    return results;
  }
}
export const registry = KnowledgeRegistry.getInstance();
