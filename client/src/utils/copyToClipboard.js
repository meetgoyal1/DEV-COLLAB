/**
 * Copy text synchronously inside a click handler.
 * Async clipboard calls often fail because the browser drops the user-gesture context.
 */
export function copyToClipboard(text) {
  if (!text) return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const savedRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  if (savedRange && selection) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  if (copied) return true;

  // Last resort — fire-and-forget while gesture may still be active
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}
