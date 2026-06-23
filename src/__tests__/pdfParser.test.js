import { describe, it, expect, vi } from 'vitest';
import { extractTextFromPDF } from '../utils/pdfParser';

// Mock pdfjs-dist to avoid DOMMatrix and Worker dependencies in jsdom
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

import * as pdfjsLib from 'pdfjs-dist';

describe('extractTextFromPDF', () => {
  it('解析有效 PDF 文件返回文本', async () => {
    // Setup mock: successful PDF with 1 page containing text
    const mockGetTextContent = vi.fn().mockResolvedValue({
      items: [{ str: 'Hello' }, { str: 'World' }],
    });
    const mockGetPage = vi.fn().mockResolvedValue({
      getTextContent: mockGetTextContent,
    });
    pdfjsLib.getDocument.mockReturnValue({
      promise: { numPages: 1, getPage: mockGetPage },
    });

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const result = await extractTextFromPDF(file);
    expect(result).toBe('Hello World');
  });

  it('非 PDF 文件抛出 PDF_PARSE_FAILED', async () => {
    // Setup mock: getDocument throws an error during parsing
    pdfjsLib.getDocument.mockImplementation(() => {
      throw new Error('Invalid PDF structure');
    });

    const file = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });
    await expect(extractTextFromPDF(file)).rejects.toThrow('PDF_PARSE_FAILED');
  });
});
