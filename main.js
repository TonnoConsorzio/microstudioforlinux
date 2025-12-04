const { app, BrowserWindow, shell } = require("electron");

const MICROSTUDIO_URL = "https://microstudio.dev/";
const APP_TITLE = "Microstudio";
const OFFLINE_HTML = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_TITLE}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f172a;
      --panel: #111827;
      --accent: #22d3ee;
      --muted: #cbd5e1;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Inter", "SF Pro Display", "Segoe UI", -apple-system, sans-serif;
      background: radial-gradient(120% 120% at 20% 20%, rgba(34,211,238,0.07), transparent 60%), var(--bg);
      color: var(--muted);
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      width: min(560px, 100%);
      background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.06)), var(--panel);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.45);
    }
    h1 {
      margin: 0 0 12px;
      color: white;
      font-size: 28px;
      letter-spacing: -0.02em;
    }
    p { margin: 0 0 24px; line-height: 1.6; }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(34,211,238,0.12);
      color: #67e8f9;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    button {
      background: linear-gradient(90deg, #22d3ee, #0ea5e9);
      color: #0b1224;
      border: none;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 14px 30px rgba(14,165,233,0.35);
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 40px rgba(14,165,233,0.35);
      filter: saturate(1.02);
    }
    button:active { transform: translateY(0); box-shadow: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="pill">Offline</div>
    <h1>Impossibile raggiungere microstudio.dev</h1>
    <p>Controlla la connessione a Internet e riprova. L'app rimane in esecuzione: appena la rete torna disponibile si può ricaricare il sito.</p>
    <button onclick="location.href='${MICROSTUDIO_URL}'">Ricarica Microstudio</button>
  </div>
</body>
</html>
`.trim();

const singleInstance = app.requestSingleInstanceLock();

if (!singleInstance) {
  app.quit();
} else {
  app.setName(APP_TITLE);

  app.on("second-instance", () => {
    const [firstWindow] = BrowserWindow.getAllWindows();
    if (firstWindow) {
      if (firstWindow.isMinimized()) firstWindow.restore();
      firstWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 640,
    title: APP_TITLE,
    backgroundColor: "#0f172a",
    autoHideMenuBar: true,
    useContentSize: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      defaultEncoding: "utf-8",
    },
  });

  const userAgent = `${win.webContents.getUserAgent()} MicrostudioDesktop/${app.getVersion()}`;
  win.webContents.setUserAgent(userAgent);

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(MICROSTUDIO_URL)) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(MICROSTUDIO_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.on("did-fail-load", (_event, errorCode) => {
    if (errorCode === -3) return; // aborted (likely due to navigation change)
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(OFFLINE_HTML)}`);
  });

  win.loadURL(MICROSTUDIO_URL);
}
