/* Selection and compatibility rules shared by the UI and regression tests. */
const catalogModel = (() => {
  const rank = { stable: 3, beta: 2, dev: 1 };
  function compare(a, b) {
    const av = [...a.version.split(".").map(Number), a.revision];
    const bv = [...b.version.split(".").map(Number), b.revision];
    for (let i = 0; i < av.length; i++) if (av[i] !== bv[i]) return bv[i] - av[i];
    return (rank[b.channel] || 0) - (rank[a.channel] || 0);
  }
  function candidates(catalog, selection) {
    return catalog.releases.filter(r =>
      (r.firmware || "ardupilot") === selection.firmware && r.board === selection.board &&
      (selection.firmware !== "inav" || r.version.split(".")[0] === selection.line) &&
      (selection.channel === "all" || r.channel === selection.channel)
    ).sort(compare);
  }
  function capabilities(release) {
    if (!release || release.firmware !== "inav") return { can: false, dshot: false, escTelemetry: false, imuReserve: false };
    const major = Number(release.version.split(".")[0]), revision = release.revision;
    return {
      can: major === 10 && revision >= 16,
      dshot: major >= 10 || (major === 9 && revision >= 10),
      escTelemetry: major >= 10 || (major === 9 && revision >= 14),
      imuReserve: release.board === "mini-v2-vib" && ((major === 9 && revision >= 16) || (major === 10 && revision >= 18)),
    };
  }
  function selectionFromUrl(search) {
    const p = new URLSearchParams(search);
    const firmware = p.get("firmware") === "inav" ? "inav" : "ardupilot";
    const requestedVersion = p.get("version") || "latest";
    const versionLine = /-(9|10)\.\d+\.\d+-r/.exec(requestedVersion)?.[1];
    const line = ["9", "10"].includes(p.get("line")) ? p.get("line") : versionLine || "9";
    const board = ["mini", "mini-v2", "mini-v2-vib", "pro"].includes(p.get("board")) ? p.get("board") : "mini-v2";
    return {
      firmware, board: firmware === "inav" && board === "pro" ? "mini-v2" : board,
      line, vehicle: ["copter", "plane", "rover"].includes(p.get("vehicle")) ? p.get("vehicle") : "copter",
      channel: ["all", "stable", "beta", "dev"].includes(p.get("channel")) ? p.get("channel") :
        firmware === "inav" ? (line === "9" ? "stable" : "dev") : "all",
      version: requestedVersion,
    };
  }
  function urlParams(selection) {
    const params = new URLSearchParams({ firmware: selection.firmware, board: selection.board, channel: selection.channel });
    if (selection.firmware === "inav") params.set("line", selection.line);
    else params.set("vehicle", selection.vehicle);
    if (selection.version !== "latest") params.set("version", selection.version);
    return params;
  }
  return { candidates, capabilities, compare, selectionFromUrl, urlParams };
})();
if (typeof module !== "undefined") module.exports = catalogModel;
