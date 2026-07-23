import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
  url: "http://localhost/",
});

Object.defineProperties(globalThis, {
  window: { configurable: true, value: dom.window },
  document: { configurable: true, value: dom.window.document },
  navigator: { configurable: true, value: dom.window.navigator },
  Node: { configurable: true, value: dom.window.Node },
  NodeFilter: { configurable: true, value: dom.window.NodeFilter },
  Element: { configurable: true, value: dom.window.Element },
  SVGElement: { configurable: true, value: dom.window.SVGElement },
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
  getComputedStyle: {
    configurable: true,
    value: dom.window.getComputedStyle.bind(dom.window),
  },
  requestAnimationFrame: {
    configurable: true,
    value: dom.window.requestAnimationFrame.bind(dom.window),
  },
  cancelAnimationFrame: {
    configurable: true,
    value: dom.window.cancelAnimationFrame.bind(dom.window),
  },
  ResizeObserver: {
    configurable: true,
    value: class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  },
  IS_REACT_ACT_ENVIRONMENT: {
    configurable: true,
    value: true,
    writable: true,
  },
});

Object.defineProperty(dom.window.Element.prototype, "getAnimations", {
  configurable: true,
  value: () => [],
});

export const { act, cleanup, fireEvent, render, within } = await import(
  "@testing-library/react"
);
