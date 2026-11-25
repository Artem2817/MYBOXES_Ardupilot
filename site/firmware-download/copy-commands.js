/* Copy complete CLI blocks, including asynchronously loaded hardware references. */
(() => {
  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_) { /* Use the selection-based fallback if clipboard access is unavailable. */ }
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  }
  function decorate(pre) {
    if (pre.dataset.copyReady) return;
    const text = (pre.querySelector("code") || pre).textContent.trim();
    if (!text) return;
    pre.dataset.copyReady = "true";
    pre.classList.add("copyable-commands");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-commands";
    button.textContent = "Копировать";
    button.setAttribute("aria-label", "Скопировать команды");
    button.setAttribute("aria-live", "polite");
    let reset;
    button.addEventListener("click", async () => {
      clearTimeout(reset);
      try {
        await copyText(text);
        button.textContent = "Скопировано";
      } catch (_) {
        button.textContent = "Не удалось скопировать";
      }
      reset = setTimeout(() => { button.textContent = "Копировать"; }, 2200);
    });
    pre.append(button);
  }
  function attach(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.matches?.("pre")) decorate(root);
    root.querySelectorAll("pre").forEach(decorate);
  }
  attach(document);
  new MutationObserver(records => {
    for (const record of records) for (const added of record.addedNodes) attach(added);
  }).observe(document.body, {childList:true, subtree:true});
})();
