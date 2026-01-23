
import FlexSearch from 'flexsearch';
import { IIIFItem, IIIFAnnotation, IIIFCanvas } from '../types';

export interface SearchResult {
  id: string;
  type: string;
  label: string;
  context: string;
  match: string;
}

class SearchService {
  private index: any;
  private itemMap: Map<string, { item: IIIFItem | IIIFAnnotation; parent?: string }> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    // Since we are using Vite with node_modules, FlexSearch should be imported directly.
    // However, depending on the build, it might be a default export or named.
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Document = (FlexSearch as any).Document;
    
    // If not found on top level, try default (common in some CJS/ESM interop scenarios)
    if (!Document && (FlexSearch as any).default) {
        Document = (FlexSearch as any).default.Document;
    }

    if (!Document) {
      // Fallback: If FlexSearch is the Document constructor itself (rare but possible in some builds)
      // or if we are using a specific build.
      // Let's assume standard usage from npm package first.
      console.error("FlexSearch Document constructor not found. FlexSearch keys:", Object.keys(FlexSearch));
      return;
    }

    try {
      this.index = new Document({
        document: {
          id: "id",
          index: ["label", "text"],
          store: ["id", "type", "label", "context"]
        },
        tokenize: "forward"
      });
    } catch (e) {
      console.error("Failed to initialize FlexSearch index", e);
    }
    this.itemMap.clear();
  }

  buildIndex(root: IIIFItem | null) {
    this.reset();
    if (!root) return;
    this.traverse(root, []);
    console.log(`Indexed ${this.itemMap.size} items.`);
  }

  private traverse(item: IIIFItem, path: string[]) {
    const label = item.label?.['none']?.[0] || item.label?.['en']?.[0] || 'Untitled';
    const summary = item.summary?.['none']?.[0] || item.summary?.['en']?.[0] || '';
    
    // Index current item
    this.index.add({
      id: item.id,
      label: label,
      text: summary,
      type: item.type,
      context: path.join(' > ')
    });
    
    this.itemMap.set(item.id, { item });

    const newPath = [...path, label];

    // Recurse Items
    if (item.items) {
      for (const child of item.items) {
        this.traverse(child, newPath);
      }
    }

    // Index Annotations (specifically for Canvases)
    if (item.type === 'Canvas' && (item as IIIFCanvas).annotations) {
      (item as IIIFCanvas).annotations?.forEach(page => {
        page.items.forEach(anno => {
          let text = '';
          if (Array.isArray(anno.body)) {
             // Complex body
          } else if (anno.body.type === 'TextualBody') {
             text = anno.body.value;
          }

          if (text) {
             const annoLabel = (anno as any).label || 'Annotation';
             this.index.add({
                id: anno.id,
                label: annoLabel,
                text: text,
                type: 'Annotation',
                context: [...newPath, 'Annotations'].join(' > ')
             });
             this.itemMap.set(anno.id, { item: anno, parent: item.id });
          }
        });
      });
    }
  }

  search(query: string, filterType?: string): SearchResult[] {
    if (!query) return [];
    
    const results = this.index.search(query, {
      limit: 50,
      enrich: true
    });

    const output: SearchResult[] = [];
    const seen = new Set<string>();

    for (const fieldResult of results) {
      for (const doc of fieldResult.result) {
         if (seen.has(doc.doc.id)) continue;
         if (filterType && doc.doc.type !== filterType) continue;

         seen.add(doc.doc.id);
         output.push({
           id: doc.doc.id,
           type: doc.doc.type,
           label: doc.doc.label,
           context: doc.doc.context,
           match: query // FlexSearch doesn't easily give snippets in this mode without custom logic
         });
      }
    }

    return output;
  }
  
  getParentId(id: string): string | undefined {
      return this.itemMap.get(id)?.parent;
  }
}

export const searchService = new SearchService();
