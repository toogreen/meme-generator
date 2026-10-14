// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (!window.PointerEvent) {
  class PointerEvent extends window.MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
    }
  }
  window.PointerEvent = PointerEvent;
}

if (!window.DragEvent) {
  class DragEvent extends window.MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.dataTransfer = params.dataTransfer || null;
    }
  }
  window.DragEvent = DragEvent;
}
