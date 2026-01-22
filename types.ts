export type IIIFMotivation = 'painting' | 'commenting' | 'supplementing' | 'tagging';

export interface IIIFResource {
  id: string;
  type: string;
  label?: Record<string, string[]>;
  summary?: Record<string, string[]>;
  metadata?: Array<{
    label: Record<string, string[]>;
    value: Record<string, string[]>;
  }>;
  requiredStatement?: {
    label: Record<string, string[]>;
    value: Record<string, string[]>;
  };
  rights?: string;
  navDate?: string;
  thumbnail?: Array<{
    id: string;
    type: 'Image';
    format: string;
  }>;
}

export interface IIIFAnnotationBody {
  id?: string;
  type: 'TextualBody' | 'Image';
  value?: string;
  format?: string;
  language?: string;
}

export interface IIIFAnnotationTarget {
  source: string; // ID of the canvas
  selector?: {
    type: 'FragmentSelector';
    value: string; // xywh=x,y,w,h
  };
}

export interface IIIFAnnotation extends IIIFResource {
  type: 'Annotation';
  motivation: IIIFMotivation;
  body: IIIFAnnotationBody;
  target: string | IIIFAnnotationTarget;
}

export interface IIIFAnnotationPage extends IIIFResource {
  type: 'AnnotationPage';
  items: IIIFAnnotation[];
}

export interface IIIFCanvas extends IIIFResource {
  type: 'Canvas';
  height: number;
  width: number;
  items: IIIFAnnotationPage[]; // Painting annotations (the image itself)
  annotations?: IIIFAnnotationPage[]; // Commenting/Supplementing annotations
  // Internal use for the editor (not part of IIIF export)
  _blobUrl?: string; 
}

export interface IIIFManifest extends IIIFResource {
  type: 'Manifest';
  context?: string;
  items: IIIFCanvas[];
}

export interface IIIFCollection extends IIIFResource {
    type: 'Collection';
    context?: string;
    items: (IIIFManifest | IIIFCollection)[];
}

// Union type for the root of our tree
export type IIIFItem = IIIFManifest | IIIFCollection;

export interface IngestResult {
  root: IIIFItem | null;
}

export type AIProvider = 'gemini' | 'ollama' | 'none';

export interface AIConfig {
  provider: AIProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
}