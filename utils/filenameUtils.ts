
// Patterns from Documentation/regex library.md
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
  }
];

// Helper to normalize strings for comparison
const normalizeForComparison = (filename: string): string => {
  return filename
    .replace(/\.[^/.]+$/, '')           // remove extension
    .replace(/[\s._\-]?\d+[\s._\-]?/g, '') // remove numbers
    .replace(/_(copy|dup|backup|old|new|final|rev|draft)\d*/gi, '')
    .toLowerCase();
};

// Create N-Grams (bi-grams default)
const createNGrams = (str: string, n = 2): Set<string> => {
  const grams = new Set<string>();
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized.length < n) return grams;
  for (let i = 0; i <= normalized.length - n; i++) {
    grams.add(normalized.slice(i, i + n));
  }
  return grams;
};

// Jaccard Similarity
const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

export interface SimilarityMatch {
  filename: string;
  reason: string;
  score: number;
}

/**
 * Finds files similar to the target filename from a list of candidates.
 * Uses a combination of Regex Pattern Matching and N-Gram Similarity.
 */
export const findSimilarFiles = (
  targetFilename: string, 
  candidates: string[], 
  options = { threshold: 0.6 }
): SimilarityMatch[] => {
  const matches: SimilarityMatch[] = [];
  const targetGrams = createNGrams(targetFilename);
  
  // 1. Check for Sequence/Pattern relationships (High Confidence)
  const matchingPattern = filenameRelationshipPatterns.find(p => p.regex.test(targetFilename));
  let targetBase = '';
  
  if (matchingPattern) {
    const match = targetFilename.match(matchingPattern.regex);
    // If groups exist and first group is 'base' (common convention in our patterns)
    if (match && matchingPattern.groups && matchingPattern.groups[0] === 'base') {
      targetBase = match[1].toLowerCase();
    }
  }

  for (const candidate of candidates) {
    if (candidate === targetFilename) continue;

    // A. Pattern Matching (Sequence Detection)
    if (matchingPattern && targetBase) {
      const candidateMatch = candidate.match(matchingPattern.regex);
      if (candidateMatch && candidateMatch[1].toLowerCase() === targetBase) {
        matches.push({
          filename: candidate,
          reason: `Part of same ${matchingPattern.name.toLowerCase()}`,
          score: 1.0
        });
        continue; // Skip N-Gram check if pattern matches
      }
    }

    // B. N-Gram Fuzzy Matching (Fallback)
    const candidateGrams = createNGrams(candidate);
    const sim = jaccardSimilarity(targetGrams, candidateGrams);
    
    if (sim >= options.threshold) {
      matches.push({
        filename: candidate,
        reason: 'Similar naming pattern',
        score: sim
      });
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
};
