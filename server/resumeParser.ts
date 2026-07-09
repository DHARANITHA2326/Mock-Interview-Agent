import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts readable plain text from a Base64 encoded file string.
 * Supports PDF (.pdf), Word (.docx), and plain text files.
 */
export async function extractTextFromBase64(base64Data: string, fileName: string): Promise<string> {
  // Strip data: url prefix if present (e.g. "data:application/pdf;base64,")
  let cleanBase64 = base64Data;
  if (base64Data.includes(';base64,')) {
    cleanBase64 = base64Data.split(';base64,')[1];
  }

  const buffer = Buffer.from(cleanBase64, 'base64');
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    const parseFn = (pdfParse as any).default || pdfParse;
    const parsed = await parseFn(buffer);
    if (!parsed || !parsed.text) {
      throw new Error('PDF parsing resulted in empty text');
    }
    return parsed.text;
  } else if (lowerName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    if (!result || !result.value) {
      throw new Error('DOCX parsing resulted in empty text');
    }
    return result.value;
  } else {
    // Treat as standard text / fallback
    const text = buffer.toString('utf-8');
    if (!text.trim()) {
      throw new Error('File content is empty');
    }
    return text;
  }
}
