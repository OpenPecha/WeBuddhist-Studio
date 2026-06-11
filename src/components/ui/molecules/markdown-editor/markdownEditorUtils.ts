export type TextSelection = {
  start: number;
  end: number;
  text: string;
};

export function getTextSelection(
  value: string,
  textarea: HTMLTextAreaElement,
): TextSelection {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  return {
    start,
    end,
    text: value.slice(start, end),
  };
}

export function insertAtSelection(
  value: string,
  start: number,
  end: number,
  insertText: string,
): { nextValue: string; cursorStart: number; cursorEnd: number } {
  const nextValue = value.slice(0, start) + insertText + value.slice(end);
  const cursorStart = start + insertText.length;
  return { nextValue, cursorStart, cursorEnd: cursorStart };
}

export function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
): { nextValue: string; cursorStart: number; cursorEnd: number } {
  const selected = value.slice(start, end);
  const insertText = `${before}${selected}${after}`;
  const nextValue = value.slice(0, start) + insertText + value.slice(end);
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { nextValue, cursorStart, cursorEnd };
}

export function buildMarkdownLink(label: string, url: string): string {
  return `[${label}](${url})`;
}
