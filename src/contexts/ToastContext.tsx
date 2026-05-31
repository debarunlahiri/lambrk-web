"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";

type ToastType = "info" | "success" | "error" | "loading";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType) => string;
  update: (id: string, message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (type !== "loading") {
        const timer = setTimeout(() => dismiss(id), 5000);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const update = useCallback(
    (id: string, message: string, type: ToastType = "info") => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, type } : t)));
      if (type !== "loading") {
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => dismiss(id), 5000);
        timers.current.set(id, newTimer);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show, update, dismiss }), [show, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-24 z-[100] flex flex-col gap-2 md:bottom-6 md:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const bg =
    toast.type === "success"
      ? "bg-green-500/90"
      : toast.type === "error"
        ? "bg-red-500/90"
        : toast.type === "loading"
          ? "bg-accent/90"
          : "bg-foreground/90";

  const text =
    toast.type === "success" || toast.type === "error" ? "text-white" : "text-white";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ring-1 ring-white/10 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-200 ${bg}`}
    >
      {toast.type === "loading" ? (
        <LoaderIcon />
      ) : toast.type === "success" ? (
        <SuccessIcon />
      ) : toast.type === "error" ? (
        <ErrorIcon />
      ) : (
        <InfoIcon />
      )}
      <p className={`text-sm font-medium ${text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
