import { app, BrowserWindow, session, shell } from 'electron';
import path from 'node:path';
import { registerIpc } from '../ipc/register';

let windowRef: BrowserWindow | undefined;
function createWindow(): void {
  windowRef = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1120, minHeight: 720, show: false,
    backgroundColor: '#0b0d12', titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, webSecurity: true }
  });
  windowRef.once('ready-to-show', () => windowRef?.show());
  windowRef.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith('https://')) void shell.openExternal(url); return { action: 'deny' }; });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void windowRef.loadURL(devUrl); else void windowRef.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
}
app.whenReady().then(() => {
  const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);
  const contentSecurityPolicy = isDevelopment
    ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:5173 ws://localhost:5173; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [contentSecurityPolicy] } }));
  registerIpc(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
