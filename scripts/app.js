(() => {
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const themeSelect = document.getElementById("theme");
  const scaleSelect = document.getElementById("scale");
  const exportBtn = document.getElementById("exportBtn");

  const state = {
    renderToken: 0,
    wasmReady: false,
  };

  mermaid.initialize({
    startOnLoad: false,
    theme: themeSelect.value,
  });

  function setPreviewError(message) {
    const safeMessage = (message || "Unknown render error").toString();
    preview.innerHTML = `<pre class="error">${safeMessage}</pre>`;
  }

  async function renderDiagram() {
    const code = editor.value.trim();
    if (!code) {
      preview.innerHTML = "";
      return;
    }

    const token = ++state.renderToken;

    try {
      const id = `mermaid-${token}`;
      const { svg } = await mermaid.render(id, code);

      if (token !== state.renderToken) {
        return;
      }

      preview.innerHTML = svg;
    } catch (error) {
      if (token === state.renderToken) {
        setPreviewError(error?.message);
      }
    }
  }

  let debounceTimer = null;
  editor.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderDiagram, 300);
  });

  themeSelect.addEventListener("change", () => {
    mermaid.initialize({
      startOnLoad: false,
      theme: themeSelect.value,
    });
    renderDiagram();
  });

  async function initWasm() {
    try {
      await resvg.initWasm(
        fetch("https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.4.1/index_bg.wasm")
      );
      state.wasmReady = true;
    } catch (error) {
      state.wasmReady = false;
      console.error("Failed to initialize Resvg WASM", error);
    }
  }

  exportBtn.addEventListener("click", async () => {
    if (!state.wasmReady) {
      alert("Exporter is still loading. Please wait a moment and try again.");
      return;
    }

    const svgEl = preview.querySelector("svg");
    if (!svgEl) {
      alert("No diagram to export. Enter a valid Mermaid diagram first.");
      return;
    }

    const scale = Number.parseInt(scaleSelect.value, 10) || 1;
    const svg = new XMLSerializer().serializeToString(svgEl);

    const renderer = new resvg.Resvg(svg, {
      fitTo: { mode: "zoom", value: scale },
    });

    const png = renderer.render().asPng();
    const blob = new Blob([png], { type: "image/png" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `diagram-${scale}x.png`;
    anchor.click();

    URL.revokeObjectURL(url);
  });

  initWasm();
  renderDiagram();
})();
