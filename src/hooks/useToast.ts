type ToastType = "success" | "error" | "info";
export type ToastItem = { id: number; message: string; type: ToastType };
type Listener = (toasts: ToastItem[]) => void;

let _toasts: ToastItem[] = [];
let _listeners: Listener[] = [];
let _nextId = 0;

function _notify() {
  _listeners.forEach((l) => l([..._toasts]));
}

export function toast(message: string, type: ToastType = "success", duration = 3000) {
  const id = _nextId++;
  _toasts = [..._toasts, { id, message, type }];
  _notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    _notify();
  }, duration);
}

export function subscribeToasts(fn: Listener) {
  _listeners.push(fn);
  fn([..._toasts]);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}
