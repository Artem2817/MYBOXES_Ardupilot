/* Public release refresh for both firmware repositories. */
const liveCatalog = (() => {
  const boards = { mini: "MyboxH743 Mini", "mini-v2": "MyboxH743 Mini v2", "mini-v2-vib": "MyboxH743 Mini v2 Vib", pro: "MyboxH743 Pro" };
  const targets = { mini: "MYBOXH743MINI", "mini-v2": "MYBOXH743MINIV2", "mini-v2-vib": "MYBOXH743MINIV2VIB_BENCH" };
  function normalize(release, firmware) {
    const match = /^myboxh743-(mini-v2-vib|mini-v2|mini|pro)-([0-9]+\.[0-9]+\.[0-9]+)-r([1-9][0-9]*)(?:-(dev|beta))?$/.exec(release.tag_name || "");
    if (release.draft || !match) return null;
    const [, board, version, revision, suffix] = match;
    let assets = (release.assets || []).filter(a => (a.state || "uploaded") === "uploaded").map(a => {
      const lower = a.name.toLowerCase();
      const vehicle = /-(copter|plane|rover)-/.exec(lower)?.[1] || null;
      return { name: a.name, size: a.size || 0, download_count: a.download_count || 0,
        url: a.browser_download_url, vehicle, format: lower.split(".").pop(),
        component: lower.includes("-iomcu-") ? "iomcu" : lower.includes("-bootloader-") ? "bootloader" : vehicle ? "vehicle" : "metadata",
        with_bootloader: lower.includes("with-bootloader") };
    });
    if (firmware === "inav") {
      if (!targets[board]) return null;
      const names = [`inav_${version}_${targets[board]}.hex`, "manifest.json", "SHA256SUMS.txt"];
      if (!names.every(name => assets.some(a => a.name === name))) return null;
      assets = names.map(name => assets.find(a => a.name === name));
      assets[0].component = "firmware";
    }
    const channel = suffix || (release.prerelease ? "beta" : "stable");
    return { firmware, bench_only: firmware === "inav" && channel !== "stable", board, board_name: boards[board],
      version, revision: Number(revision), channel,
      tag: release.tag_name, title: release.name || release.tag_name,
      notes: String(release.body || "").slice(0, 12000),
      published_at: release.published_at || release.created_at, release_url: release.html_url,
      target: release.target_commitish || "", prerelease: Boolean(release.prerelease), assets };
  }
  function compare(a, b) {
    const av = [...a.version.split(".").map(Number), a.revision];
    const bv = [...b.version.split(".").map(Number), b.revision];
    for (let i = 0; i < av.length; i++) if (av[i] !== bv[i]) return bv[i] - av[i];
    return 0;
  }
  async function refresh(catalog, request = fetch) {
    const sources = { ardupilot: "Artem2817/MYBOXES_Ardupilot", inav: "Artem2817/MYBOXES_INAV" };
    const results = await Promise.allSettled(Object.entries(sources).map(async ([firmware, repo]) => {
      const response = await request(`https://api.github.com/repos/${repo}/releases?per_page=100`,
        { cache: "no-store", headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const releases = await response.json();
      if (!Array.isArray(releases)) throw new Error("Invalid releases response");
      return releases.map(r => normalize(r, firmware)).filter(Boolean);
    }));
    if (!results.some(r => r.status === "fulfilled")) return null;
    const merged = new Map(catalog.releases.map(r => [`${r.firmware || "ardupilot"}:${r.tag}`, r]));
    for (const result of results) if (result.status === "fulfilled") {
      for (const release of result.value) merged.set(`${release.firmware}:${release.tag}`, release);
    }
    return { ...catalog, releases: [...merged.values()].sort(compare) };
  }
  return { normalize, compare, refresh };
})();
