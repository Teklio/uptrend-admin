const WORDS_PER_MINUTE = 200;

export const countWords = (markdown: string) => markdown.trim().split(/\s+/).filter(Boolean).length;

export const estimateReadingTime = (markdown: string) => Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));
