/**
 * Parses a custom chapters string (e.g., "1-3, 5, 8") into an array of chapter numbers.
 */
export function parseCustomChapters(input: string): number[] {
  if (!input || !input.trim()) return [];
  
  const chapters = new Set<number>();
  const parts = input.split(',').map(p => p.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          chapters.add(i);
        }
      } else if (!isNaN(start)) {
        chapters.add(start);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        chapters.add(num);
      }
    }
  }
  
  return Array.from(chapters).sort((a, b) => a - b);
}

/**
 * Returns a formatted string for the chapter group to display in the UI.
 * E.g., "1-3, 5" if customChapters is present, otherwise falls back to startChapter-endChapter.
 */
export function formatChapterGroup(group: { startChapter?: number; endChapter?: number; customChapters?: string }): string {
  if (group.customChapters && group.customChapters.trim()) {
    return group.customChapters;
  }
  
  if (group.startChapter !== undefined && group.endChapter !== undefined) {
    if (group.startChapter === group.endChapter) {
      return `${group.startChapter}`;
    }
    return `${group.startChapter}-${group.endChapter}`;
  }
  
  return '';
}
