import '@testing-library/jest-dom';

// Polyfill DOMMatrix for pdfjs-dist in jsdom test environment
if (!globalThis.DOMMatrix) {
  class DOMMatrix {
    constructor(init) {
      if (init && init.length === 6) {
        this.a = init[0];
        this.b = init[1];
        this.c = init[2];
        this.d = init[3];
        this.e = init[4];
        this.f = init[5];
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }
  }
  globalThis.DOMMatrix = DOMMatrix;
}
