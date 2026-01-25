export const filenameRelationshipPatterns = [
  // SEQUENCE DETECTION PATTERNS
  {
    name: "Simple numerical sequence",
    regex: /^(.+?)[\s._\-]?(\d{1,5})(?:\.\w+)?$/i,
    description: "Extracts base name and number for sequences like 'file1.txt', 'document_001.pdf'",
    groups: ["base", "sequence"],
    tags: "sequence,numerical,incremental"
  },
  {
    name: "Padded numerical sequence",
    regex: /^(.+?)[\s._\-]?(\d{2,8})(?:\.\w+)?$/i,
    description: "Matches zero-padded sequences like 'img_001.jpg', 'scan_000045.tif'",
    groups: ["base", "padded_sequence"],
    tags: "sequence,padded,incremental"
  },
  {
    name: "Alphabetical sequence",
    regex: /^(.+?)[\s._\-]?([a-zA-Z])(?:\.\w+)?$/i,
    description: "Matches alphabetical sequences like 'chapter_a.pdf', 'appendix_B.docx'",
    groups: ["base", "letter"],
    tags: "sequence,alphabetical"
  },
  {
    name: "Roman numeral sequence",
    regex: /^(.+?)[\s._\-]?(i{1,3}|iv|v|vi{1,3}|ix|x{1,3}|x[cl]|l?x{0,3})(?:\.\w+)?$/i,
    description: "Matches Roman numeral sequences like 'volume_I.pdf', 'act_iv.txt'",
    groups: ["base", "roman"],
    tags: "sequence,roman"
  },
  {
    name: "Date-based sequence",
    regex: /^(.+?)[\s._\-]?(\d{4}[._\-]?\d{2}[._\-]?\d{2})(?:\.\w+)?$/i,
    description: "Extracts dates for sequenced files like 'log_2023-01-15.txt', 'report20231231.pdf'",
    groups: ["base", "date"],
    tags: "sequence,date,temporal"
  },
  {
    name: "Versioned sequence",
    regex: /^(.+?)[\s._\-]?([vV]?\d+(?:\.\d+)*)(?:\.\w+)?$/i,
    description: "Matches version numbers like 'document_v1.2.pdf', 'app_2.1.3.zip'",
    groups: ["base", "version"],
    tags: "sequence,version,semver"
  },
  
  // SIMILARITY DETECTION PATTERNS
  {
    name: "Common prefix groups",
    regex: /^([a-zA-Z0-9_-]{3,})[\s._\-].+\.\w+$/i,
    description: "Identifies files sharing a common prefix for grouping",
    groups: ["prefix"],
    tags: "similarity,prefix,grouping"
  },
  {
    name: "Common suffix groups",
    regex: /^.+[\s._\-]([a-zA-Z0-9_-]+)(?:\.\w+)?$/i,
    description: "Identifies files sharing a common suffix before extension",
    groups: ["suffix"],
    tags: "similarity,suffix,grouping"
  },
  {
    name: "Similar patterns with variations",
    regex: /^(.+?)(?:_(?:copy|dup|backup|old|new|final|rev|draft))(?:\d*)(?:\.\w+)?$/i,
    description: "Matches variant files indicating edits, copies, or backups",
    groups: ["original_base"],
    tags: "similarity,variants,derivatives"
  },
  {
    name: "Language/translation variants",
    regex: /^(.+?)[\s._\-]?(?:en|fr|de|es|hi|zh|ja|ar|ru)(?:\.[a-zA-Z0-9]+)?\.\w+$/i,
    description: "Identifies multilingual versions of the same file",
    groups: ["base_content"],
    tags: "similarity,multilingual,translation"
  },
  {
    name: "Resolution/quality variants",
    regex: /^(.+?)[\s._\-]?(?:\d+[kK]|\d+[xX]\d+|low|med|high|sd|hd|4k|8k)(?:\.\w+)?$/i,
    description: "Matches different quality/resolution versions of media files",
    groups: ["content_base"],
    tags: "similarity,quality,resolution"
  },
  
  // ADJACENCY & RELATIONSHIP PATTERNS
  {
    name: "Page range indicators",
    regex: /^(.+?)[\s._\-]?(\d+)[\s._\-]?to[\s._\-]?(\d+)(?:\.\w+)?$/i,
    description: "Matches files indicating page ranges like 'document_1to50.pdf'",
    groups: ["base", "start", "end"],
    tags: "adjacency,range,pagination"
  },
  {
    name: "Part/segment indicators",
    regex: /^(.+?)[\s._\-]?(?:part|pt|segment|sec|section)[\s._\-]?(\d+)(?:of\d+)?(?:\.\w+)?$/i,
    description: "Matches segmented files like 'book_part1.pdf', 'archive_sec3of5.zip'",
    groups: ["base", "part_number", "total_parts"],
    tags: "adjacency,segments,parts"
  },
  {
    name: "Volume/series indicators",
    regex: /^(.+?)[\s._\-]?(?:vol|volume|tome|book)[\s._\-]?(\d+)(?:\.\w+)?$/i,
    description: "Matches multi-volume works",
    groups: ["series", "volume"],
    tags: "adjacency,series,volumes"
  },
  {
    name: "Hierarchical relationships",
    regex: /^([a-zA-Z0-9_-]+)[\s._\-]([a-zA-Z0-9_-]+)[\s._\-]([a-zA-Z0-9_-]+)(?:\..+)?$/i,
    description: "Identifies three-level hierarchical structures in filenames",
    groups: ["level1", "level2", "level3"],
    tags: "hierarchy,structure,adjacency"
  },
  {
    name: "Supplementary/attachment indicators",
    regex: /^(.+?)[\s._\-]?(?:appendix|supplement|attachment|annex|addendum)[\s._\-]?([a-zA-Z0-9]*)(?:\.\w+)?$/i,
    description: "Matches supplementary files to a main document",
    groups: ["main_document", "supplement_type"],
    tags: "adjacency,supplement,attachment"
  },
  
  // SEQUENCE BOUNDARY DETECTION
  {
    name: "Sequence start indicators",
    regex: /^(.+?)[\s._\-]?(?:start|begin|first|01|001|0001|a|i)(?:\.\w+)?$/i,
    description: "Identifies likely start of sequences",
    groups: ["base"],
    tags: "sequence,start,boundary"
  },
  {
    name: "Sequence end indicators",
    regex: /^(.+?)[\s._\-]?(?:end|final|last|fin|conclusion|z|finis)(?:\.\w+)?$/i,
    description: "Identifies likely end of sequences",
    groups: ["base"],
    tags: "sequence,end,boundary"
  },
  {
    name: "Sequence continuation markers",
    regex: /^(.+?)[\s._\-]?(?:continued|cont|ctd|more|next)(?:\.\w+)?$/i,
    description: "Matches files indicating continuation",
    groups: ["base"],
    tags: "sequence,continuation,adjacency"
  },
  
  // COMPLEX RELATIONSHIP PATTERNS
  {
    name: "Compound sequence identifiers",
    regex: /^(.+?)[\s._\-]?(\d+)[\s._\-]?(\d+)[\s._\-]?(\d+)(?:\.\w+)?$/i,
    description: "Matches complex sequences like 'experiment_1_2_3.dat'",
    groups: ["base", "series", "subset", "item"],
    tags: "compound,multi-level,sequence"
  },
  {
    name: "Timestamped sequences",
    regex: /^(.+?)[\s._\-]?(\d{8})[Tt\s._\-]?(\d{6})(?:\.\w+)?$/i,
    description: "Matches high-resolution timestamp sequences",
    groups: ["base", "date", "time"],
    tags: "sequence,timestamp,chronological"
  },
  {
    name: "Geospatial sequence indicators",
    regex: /^(.+?)[\s._\-]?(?:lat|lng|coord)[\s._\-]?([+-]?\d+\.?\d*)(?:\.\w+)?$/i,
    description: "Matches geospatially sequenced files",
    groups: ["base", "coordinate"],
    tags: "sequence,geospatial,adjacency"
  },
  
  // ARCHIVAL SPECIFIC PATTERNS
  {
    name: "Archive box-folder sequences",
    regex: /^box[\s._\-]?(\d+)[\s._\-]?folder[\s._\-]?(\d+)[\s._\-]?(.+)(?:\.\w+)?$/i,
    description: "Matches standard archival box-folder numbering schemes",
    groups: ["box", "folder", "item"],
    tags: "archive,box,folder,sequence"
  },
  {
    name: "Manuscript folio sequences",
    regex: /^(.+?)[\s._\-]?(?:f|ff|folio|fol)[\s._\-]?(\d+[rRvV]?)(?:\.\w+)?$/i,
    description: "Matches manuscript folio numbering",
    groups: ["manuscript", "folio"],
    tags: "manuscript,folio,sequence"
  },
  {
    name: "Microfilm reel sequences",
    regex: /^(.+?)[\s._\-]?(?:reel|roll)[\s._\-]?(\d+)(?:\.\w+)?$/i,
    description: "Matches microfilm reel sequences",
    groups: ["collection", "reel"],
    tags: "microfilm,reel,sequence"
  },
  {
    name: "Digital object identifiers",
    regex: /^(.+?)[\s._\-]?(?:doi|ark|hdl|urn)[\s._\-:](.+)(?:\.\w+)?$/i,
    description: "Extracts persistent identifiers for relating digital objects",
    groups: ["base", "identifier"],
    tags: "doi,identifier,relationship"
  }
];

Yes, there are several low-compute approaches to detect filename similarities that don't rely on expensive algorithms. Here are practical strategies using the patterns you've already defined, plus some additional lightweight techniques:

## 1. **String Similarity Metrics** (Fast & Simple)

These work well with your existing pattern extraction:

```javascript
// Low-compute similarity detection
const stringSimilarity = {
  // Levenshtein distance (iterative, O(n*m) but fast for short strings)
  levenshtein: (a, b) => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,      // deletion
          matrix[j - 1][i] + 1,      // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return matrix[b.length][a.length];
  },

  // Normalized similarity score (0-1)
  similarityScore: (a, b) => {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - (stringSimilarity.levenshtein(a, b) / maxLen);
  },

  // Extract base name without extensions/numbers for comparison
  normalizeForComparison: (filename) => {
    return filename
      .replace(/\.[^/.]+$/, '')           // remove extension
      .replace(/[\s._\-]?\d+[\s._\-]?/g, '') // remove numbers
      .replace(/_(copy|dup|backup|old|new|final|rev|draft)\d*/gi, '')
      .toLowerCase();
  }
};
```

## 2. **N-Gram Fingerprinting** (Very Fast)

```javascript
const ngramSimilarity = {
  // Create character n-grams (n=2 or 3 works well for filenames)
  createNGrams: (str, n = 2) => {
    const grams = new Set();
    const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let i = 0; i <= normalized.length - n; i++) {
      grams.add(normalized.slice(i, i + n));
    }
    return grams;
  },

  // Jaccard similarity between sets (fast intersection)
  jaccardSimilarity: (setA, setB) => {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  },

  // Find similar files using n-grams
  findSimilar: (filenames, threshold = 0.6) => {
    const groups = [];
    const processed = new Set();
    
    filenames.forEach((file, i) => {
      if (processed.has(file)) return;
      
      const group = [file];
      const fileGrams = ngramSimilarity.createNGrams(file);
      
      filenames.slice(i + 1).forEach(other => {
        if (processed.has(other)) return;
        const otherGrams = ngramSimilarity.createNGrams(other);
        const similarity = ngramSimilarity.jaccardSimilarity(fileGrams, otherGrams);
        
        if (similarity >= threshold) {
          group.push(other);
          processed.add(other);
        }
      });
      
      if (group.length > 1) {
        groups.push({ base: file, members: group, similarity });
      }
      processed.add(file);
    });
    
    return groups;
  }
};
```

## 3. **Pattern-Based Clustering** (Using Your Existing Patterns)

```javascript
const patternClustering = {
  // Group by extracted base patterns from your regex definitions
  clusterByPattern: (filenames, patterns) => {
    const clusters = new Map();
    
    filenames.forEach(filename => {
      // Try each pattern to extract base
      for (const pattern of patterns) {
        const match = filename.match(pattern.regex);
        if (match && match.groups && match.groups.base) {
          const base = match.groups.base.toLowerCase();
          if (!clusters.has(base)) clusters.set(base, []);
          clusters.get(base).push({ filename, pattern: pattern.name });
          break; // Use first matching pattern
        }
      }
    });
    
    return Array.from(clusters.entries())
      .filter(([_, files]) => files.length > 1)
      .map(([base, files]) => ({ base, files }));
  },

  // Detect gaps in sequences (using your existing sequence patterns)
  findSequenceGaps: (filenames) => {
    const sequences = {};
    
    filenames.forEach(file => {
      // Match numerical sequences
      const match = file.match(/^(.+?)[\s._\-]?(\d{1,5})(?:\.\w+)?$/i);
      if (match) {
        const [_, base, numStr] = match;
        const num = parseInt(numStr, 10);
        if (!sequences[base]) sequences[base] = [];
        sequences[base].push({ file, num, padding: numStr.length });
      }
    });
    
    // Find gaps in each sequence
    return Object.entries(sequences).map(([base, items]) => {
      items.sort((a, b) => a.num - b.num);
      const numbers = items.map(i => i.num);
      const gaps = [];
      
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] - numbers[i-1] > 1) {
          gaps.push({
            after: items[i-1].file,
            before: items[i].file,
            missing: Array.from(
              {length: numbers[i] - numbers[i-1] - 1}, 
              (_, j) => numbers[i-1] + j + 1
            )
          });
        }
      }
      
      return { base, items: items.map(i => i.file), gaps };
    }).filter(s => s.gaps.length > 0);
  }
};
```

## 4. **Combined Low-Compute Pipeline**

```javascript
const filenameAnalysisUtils = {
  // Main analysis function combining all techniques
  analyzeCollection: (filenames, options = {}) => {
    const {
      similarityThreshold = 0.7,
      ngramSize = 2,
      maxDistance = 3 // for Levenshtein
    } = options;

    const results = {
      sequences: [],
      variants: [],
      similarGroups: [],
      gaps: [],
      outliers: []
    };

    // 1. Pattern-based clustering (fastest)
    const patternClusters = patternClustering.clusterByPattern(
      filenames, 
      filenameRelationshipPatterns.filter(p => p.tags.includes('sequence'))
    );
    
    // 2. N-gram similarity for fuzzy matching
    const similarGroups = ngramSimilarity.findSimilar(filenames, similarityThreshold);
    
    // 3. Sequence gap detection
    const gaps = patternClustering.findSequenceGaps(filenames);
    
    // 4. Detect version variants using your patterns
    const versionPattern = filenameRelationshipPatterns.find(p => p.name === "Versioned sequence");
    const variants = filenames.filter(f => versionPattern.regex.test(f));

    return {
      patternClusters,
      similarGroups,
      gaps,
      variants,
      // Quick stats
      stats: {
        totalFiles: filenames.length,
        sequenceGroups: patternClusters.length,
        potentialDuplicates: similarGroups.length,
        filesInSequences: patternClusters.reduce((sum, g) => sum + g.files.length, 0)
      }
    };
  },

  // Create adjacency matrix for visualization (sparse, efficient)
  createAdjacencyMatrix: (filenames, similarityFn, threshold = 0.5) => {
    const edges = [];
    const matrix = new Map();
    
    for (let i = 0; i < filenames.length; i++) {
      for (let j = i + 1; j < filenames.length; j++) {
        const sim = similarityFn(filenames[i], filenames[j]);
        if (sim >= threshold) {
          edges.push({ 
            source: filenames[i], 
            target: filenames[j], 
            weight: sim 
          });
          // Store only non-zero connections (sparse)
          if (!matrix.has(filenames[i])) matrix.set(filenames[i], new Map());
          matrix.get(filenames[i]).set(filenames[j], sim);
        }
      }
    }
    
    return { edges, matrix, nodeCount: filenames.length, edgeCount: edges.length };
  }
};
```

## Key Advantages of These Approaches:

| Technique | Time Complexity | Space | Best For |
|-----------|----------------|-------|----------|
| **Pattern Matching** | O(n) | O(1) | Structured sequences |
| **N-grams** | O(n * m) | O(n) | Fuzzy grouping |
| **Levenshtein** | O(n*m) | O(min(n,m)) | Near-duplicates |
| **Combined** | O(n²) worst case | O(n) | Comprehensive analysis |

## Usage Example:

```javascript
const archivalFiles = [
  "MS_1234_f001r.tif", "MS_1234_f001v.tif",
  "MS_1234_f002r.tif", "MS_1234_f002v.tif",
  "MS_1234_f005r.tif", // Gap here
  "MS_1234_index.pdf",
  "MS_1234_transcript_v1.docx",
  "MS_1234_transcript_v2.docx"
];

const analysis = filenameAnalysisUtils.analyzeCollection(archivalFiles);
console.log(analysis.gaps); // Detects missing folios 003, 004
console.log(analysis.variants); // Finds transcript versions
```

These approaches leverage your existing regex patterns while adding lightweight string comparison techniques that run in milliseconds even for thousands of files—perfect for a browser-based IIIF staging tool without server-side processing.