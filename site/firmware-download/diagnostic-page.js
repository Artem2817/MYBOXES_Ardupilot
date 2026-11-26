/* Download links follow the diagnostic release index; the HTML retains working fallback links. */
(async () => {
  try {
    const response = await fetch("diagnostic-index.json", { cache: "no-store" });
    if (!response.ok) return;
    const index = await response.json();
    const base = "https://github.com/Artem2817/MYBOXES_Diag/releases/download/v" + index.version + "/";
    const safe = url => typeof url === "string" && url.startsWith(base) &&
      /^[A-Za-z0-9_.-]+$/.test(url.slice(base.length));
    if (!/^\d+\.\d+\.\d+$/.test(index.version) || !safe(index.windows_exe)) return;
    for (const row of index.profiles || []) {
      const link = document.querySelector('[data-diag-profile="' + row.profile + '"]');
      if (link && safe(row.file)) link.href = row.file;
    }
    document.querySelector("#diag-exe-link").href = index.windows_exe;
    const release = "https://github.com/Artem2817/MYBOXES_Diag/releases/tag/v" + index.version;
    document.querySelector("#diag-release-link").href = release;
    document.querySelector("#diag-checksums-link").href = base + "SHA256SUMS.txt";
    document.querySelector("#diag-sources-link").href = base + "MYBOXES_Diag-v" + index.version + "-sources.zip";
    const firmwareVersions = [...new Set((index.profiles || []).map(p => p.version))].join(", ");
    document.querySelector("#diag-versions").textContent = "Приложение " + index.version +
      " · диагностическая прошивка " + firmwareVersions + ". Совместимые версии комплекта.";
  } catch (_) { /* Existing links stay available when the network fails. */ }
})();
