let toastHandler = null;

export function setToastHandler(handler) {
  toastHandler = handler;
}

export function clearToastHandler() {
  toastHandler = null;
}

export function showToast(message, type = 'info') {
  if (!toastHandler || !message) return;
  toastHandler(message, type);
}
