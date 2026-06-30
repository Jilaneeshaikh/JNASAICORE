import { DocumentParser, DocumentFormat } from './types';

class ParserRegistry {
  private parsers: Map<string, DocumentParser> = new Map();

  constructor() {
    this.registerDefaultParsers();
  }

  public register(parser: DocumentParser): void {
    this.parsers.set(parser.id, parser);
  }

  public getParser(id: string): DocumentParser | undefined {
    return this.parsers.get(id);
  }

  public getAllParsers(): DocumentParser[] {
    return Array.from(this.parsers.values());
  }

  public getParsersForFormat(format: DocumentFormat): DocumentParser[] {
    return this.getAllParsers()
      .filter((p) => p.supportedFormats.includes(format) && p.status === 'online')
      .sort((a, b) => b.priority - a.priority);
  }

  public setParserStatus(id: string, status: 'online' | 'offline' | 'disabled'): boolean {
    const parser = this.parsers.get(id);
    if (parser) {
      parser.status = status;
      return true;
    }
    return false;
  }

  public setParserPriority(id: string, priority: number): boolean {
    const parser = this.parsers.get(id);
    if (parser) {
      parser.priority = priority;
      return true;
    }
    return false;
  }

  private registerDefaultParsers(): void {
    // 1. PDF Parser
    this.register({
      id: 'parser-pdf-v2',
      name: 'Aerospace Specification PDF Parser',
      version: '2.4.1',
      supportedFormats: ['pdf'],
      status: 'online',
      priority: 90,
      fallbackParserId: 'parser-text-v1',
      parse: async (content) => ({
        text: `--- Aerospace Standard Doc ---\n${content || 'Raw PDF content segment.'}`,
        metadata: { pages: 24, extractedTitle: 'Aerospace Engineering Blueprint Standard' },
        outline: [
          { title: '1. Executive Summary', level: 1, page: 1 },
          { title: '2. Environmental Testing Constraints', level: 1, page: 4 },
          { title: '2.1 Temperature Shock Resistance', level: 2, page: 7 },
          { title: '3. Compliance Protocols', level: 1, page: 15 }
        ]
      })
    });

    // 2. Word Parser
    this.register({
      id: 'parser-docx-v1',
      name: 'Structured Office DOCX Parser',
      version: '1.2.0',
      supportedFormats: ['docx'],
      status: 'online',
      priority: 85,
      fallbackParserId: 'parser-text-v1',
      parse: async (content) => ({
        text: `Word document layout containing tables and formatted structural nodes:\n${content || 'Office document content.'}`,
        metadata: { author: 'Operations Specialist', wordCount: 1420 },
        outline: [
          { title: 'Document Metadata', level: 1 },
          { title: 'Standard Operational Procedures', level: 1 },
          { title: 'Sub-procedures Alpha', level: 2 }
        ]
      })
    });

    // 3. Structured Data (Excel/CSV) Parser
    this.register({
      id: 'parser-sheet-v2',
      name: 'Grid Ingestion Sheet Parser',
      version: '2.0.0',
      supportedFormats: ['xlsx', 'csv'],
      status: 'online',
      priority: 95,
      parse: async (content) => ({
        text: `Extracted grid metrics array content:\n${content || 'Row 1,Col 1,Row 1 Col 2\nRow 2,Col 1,Row 2 Col 2'}`,
        metadata: { rows: 240, columns: 12, sheetNames: ['Q3_Audit', 'Projections_2026'] },
        outline: [
          { title: 'Sheet 1: Ingestion Data Overview', level: 1 },
          { title: 'Audit Logs Summary', level: 2 }
        ]
      })
    });

    // 4. Code & Text Parser
    this.register({
      id: 'parser-text-v1',
      name: 'Generic Plaintext / Markdown Parser',
      version: '1.0.0',
      supportedFormats: ['txt', 'md', 'json'],
      status: 'online',
      priority: 50,
      parse: async (content) => ({
        text: String(content),
        metadata: { linesCount: String(content).split('\n').length },
        outline: [
          { title: 'Plaintext Stream Head', level: 1 }
        ]
      })
    });

    // 5. Engineering DRAWINGS Parser
    this.register({
      id: 'parser-cad-v3',
      name: 'Enterprise Drawing DWG/CAD Metadata Parser',
      version: '3.1.2',
      supportedFormats: ['dwg'],
      status: 'online',
      priority: 98,
      parse: async (content) => ({
        text: `CAD Blueprint Vector Metadata: Layers=0,Defpoints,Annotations. BlocksCount=42. Scale=1:50. Bounds=X(0,1000) Y(0,800). Drawing Entities extracted successfully.\n${content || 'CAD raw stream payload.'}`,
        metadata: { projection: 'Orthographic', units: 'millimeters', layerNames: ['Shell_Boundary', 'Wiring_Harness', 'Dimensions'] },
        outline: [
          { title: 'Layer Schema Definition', level: 1 },
          { title: 'Coordinate Bounds Inspection', level: 1 },
          { title: 'Component Assemblies', level: 2 }
        ]
      })
    });

    // 6. ZIP Archival Parser
    this.register({
      id: 'parser-zip-v1',
      name: 'Multi-layer Archival ZIP Registry Parser',
      version: '1.0.0',
      supportedFormats: ['zip'],
      status: 'online',
      priority: 70,
      parse: async (content) => ({
        text: `ZIP package structure:\n- specs/propulsion_control_V4.pdf (2.4 MB)\n- logs/validation_run_9.log (120 KB)\n- meta.json (14 KB)`,
        metadata: { filesCount: 3, compressionRatio: '42%' },
        outline: [
          { title: 'Archive Node Catalog', level: 1 }
        ]
      })
    });
  }
}

export const parserRegistry = new ParserRegistry();
export default parserRegistry;
