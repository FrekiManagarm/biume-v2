import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

// Add requestAnimationFrame polyfill to JSDOM
let animationFrameId = 0;
const animationFrameCallbacks = new Map<number, FrameRequestCallback>();

dom.window.requestAnimationFrame = function (callback: FrameRequestCallback) {
  const id = ++animationFrameId;
  animationFrameCallbacks.set(id, callback);
  return id;
};

dom.window.cancelAnimationFrame = function (id: number) {
  animationFrameCallbacks.delete(id);
};

// Add matchMedia polyfill to JSDOM
dom.window.matchMedia = function (query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  } as MediaQueryList;
};

Object.defineProperties(globalThis, {
  window: { configurable: true, value: dom.window },
  document: { configurable: true, value: dom.window.document },
  navigator: { configurable: true, value: dom.window.navigator },
  Node: { configurable: true, value: dom.window.Node },
  Element: { configurable: true, value: dom.window.Element },
  HTMLElement: { configurable: true, value: dom.window.HTMLElement },
  HTMLDetailsElement: {
    configurable: true,
    value: dom.window.HTMLDetailsElement,
  },
  MouseEvent: { configurable: true, value: dom.window.MouseEvent },
  KeyboardEvent: { configurable: true, value: dom.window.KeyboardEvent },
  MutationObserver: {
    configurable: true,
    value: dom.window.MutationObserver,
  },
  requestAnimationFrame: {
    configurable: true,
    value: (callback: FrameRequestCallback) => dom.window.requestAnimationFrame(callback),
  },
  cancelAnimationFrame: {
    configurable: true,
    value: (id: number) => dom.window.cancelAnimationFrame(id),
  },
  getComputedStyle: {
    configurable: true,
    value: dom.window.getComputedStyle.bind(dom.window),
  },
  IS_REACT_ACT_ENVIRONMENT: {
    configurable: true,
    value: true,
    writable: true,
  },
  matchMedia: {
    configurable: true,
    value: (query: string) => dom.window.matchMedia(query),
  },
});

export const { act, cleanup, fireEvent, render, within } = await import(
  "@testing-library/react"
);
