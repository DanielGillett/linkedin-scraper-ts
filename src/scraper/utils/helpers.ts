export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const sanitizeText = (text: string): string => {
  return text.replace(/[\n\r\t]+/g, ' ').trim();
};