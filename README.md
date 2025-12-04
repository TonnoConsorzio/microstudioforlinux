# Microstudio for Linux

Client Electron per microstudio.dev con finestra ottimizzata, fallback offline e pacchetti Linux generati via GitHub Actions (AppImage, DEB, RPM).

## Requisiti
- Node.js 18+ (l’action usa 18)
- NPM
- (Per build locali) tool di sistema per i pacchetti: `dpkg`/`rpmbuild` e dipendenze di electron-builder.

## Avvio sviluppo
```bash
npm install
npm start
```

## Build locali
```bash
# Tutte le distro Linux
npm run dist

# Target specifici
npm run build:appimage
npm run build:deb
npm run build:rpm
```
I pacchetti vengono salvati in `dist/`.

## Release con GitHub Actions
Workflow: `.github/workflows/release.yml`
- Trigger: tag che inizia per `v` (es. `v1.0.0`) o esecuzione manuale `workflow_dispatch`.
- Passi: installa dipendenze, esegue `build:appimage`, `build:deb`, `build:rpm`, carica gli artifact e pubblica la Release con i file.

Per pubblicare una release:
```bash
git tag v1.0.0
git push origin main --tags   # sostituisci 'main' con il branch usato
```

## Note sull’app
- Finestra single-instance, menu nascosto.
- Apre solo `https://microstudio.dev/`; link esterni vanno al browser di default.
- User-agent con suffisso `MicrostudioDesktop/<versione>`.
- Schermata offline stilizzata con pulsante per ricaricare microstudio.dev.

## Struttura file
- `main.js` — entrypoint Electron.
- `assets/icon.png` — icona 512x512 usata per i pacchetti.
- `.github/workflows/release.yml` — build e release automatica.
