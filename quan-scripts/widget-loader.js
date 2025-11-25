// widget-loader.js — USO LOCAL
(function () {
  // URL local donde sirve tu app widget (asegúrate de ng serve --port 4300)
  const WIDGET_URL = "http://localhost:4200/";
  const IFRAME_ID = "mf-widget-iframe";
  const CONTAINER_ID = "mf-widget-container";
  const BUTTON_ID = "mf-widget-btn";
  const TARGET_ORIGIN = new URL(WIDGET_URL).origin;

  let iframeInserted = false;

  function makeButton() {
    if (document.getElementById(BUTTON_ID)) return;
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.setAttribute("aria-label", "Abrir chat");
    btn.innerHTML = "💬";
    Object.assign(btn.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "2147483647",
      width: "56px",
      height: "56px",
      borderRadius: "28px",
      border: "none",
      background: "#0b84ff",
      color: "white",
      fontSize: "22px",
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(11,132,255,0.22)",
    });
    btn.addEventListener("click", onBtnClick);
    document.body.appendChild(btn);
  }

  function createIframeContainer() {
    if (iframeInserted) return;
    const container = document.createElement("div");
    container.id = CONTAINER_ID;
    Object.assign(container.style, {
      position: "fixed",
      right: "20px",
      bottom: "92px",
      width: "360px",
      height: "520px",
      zIndex: "2147483646",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(2,6,23,0.35)",
      display: "none",
      background: "#fff",
    });

    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.src = WIDGET_URL;
    iframe.title = "Widget Chat (local)";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    Object.assign(iframe.style, { width: "100%", height: "100%", border: "0" });

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Listen messages FROM widget
    window.addEventListener("message", (ev) => {
      // DEV: allow only the widget origin
      if (ev.origin !== TARGET_ORIGIN) return;
      const data = ev.data || {};
      if (data.type === "widget:ready") {
        console.log("[loader] widget ready");
      }
      if (data.type === "widget:resize" && data.payload?.height) {
        container.style.height = data.payload.height + "px";
      }
      if (data.type === "widget:opened") {
        console.log("[loader] widget opened chat");
      }
    });

    iframeInserted = true;
  }

  function postToWidget(msg) {
    const iframe = document.getElementById(IFRAME_ID);
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(msg, TARGET_ORIGIN);
  }

  function toggle(show) {
    const c = document.getElementById(CONTAINER_ID);
    if (!c) return;
    c.style.display = show ? "block" : "none";
  }

  function onBtnClick() {
    if (!iframeInserted) {
      createIframeContainer();
      // wait a bit for iframe to load, then open
      setTimeout(() => {
        postToWidget({ type: "widget:open_chat", payload: {} });
        toggle(true);
      }, 600);
      return;
    }
    const container = document.getElementById(CONTAINER_ID);
    const hidden = !container || container.style.display === "none";
    if (hidden) {
      postToWidget({ type: "widget:open_chat", payload: {} });
      toggle(true);
    } else {
      postToWidget({ type: "widget:close_chat", payload: {} });
      toggle(false);
    }
  }

  // lazy init on user intent (same pattern Landbot)
  function initOnce() {
    makeButton(); /* optional: createIframeContainer() */
  }
  window.addEventListener("mouseover", initOnce, { once: true });
  window.addEventListener("touchstart", initOnce, { once: true });

  // debug helpers
  window._mfWidget = {
    open: () => {
      createIframeContainer();
      postToWidget({ type: "widget:open_chat" });
      toggle(true);
    },
    close: () => {
      postToWidget({ type: "widget:close_chat" });
      toggle(false);
    },
  };
})();
