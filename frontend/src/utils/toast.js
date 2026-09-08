/**
 * GST Themed Toast Utility
 * Wraps react-hot-toast with site-consistent styling.
 *
 * Usage:
 *   import { gstToast } from '../utils/toast';
 *   gstToast.success('Saved successfully!');
 *   gstToast.error('Something went wrong.');
 *   gstToast.loading('Saving...');
 *   gstToast.info('Note: changes may take a moment.');
 */

import toast from 'react-hot-toast';

// ── Shared base style ─────────────────────────────────────────────────────────
const base = {
  duration: 4000,
  style: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '14px',
    padding: '13px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
    maxWidth: '380px',
    lineHeight: '1.45',
  },
};

// ── Variant presets ───────────────────────────────────────────────────────────
const variants = {
  success: {
    ...base,
    style: {
      ...base.style,
      background: '#f0fafa',           // teal-50
      color: '#006666',           // teal-600
      border: '1.5px solid #00a0a0', // teal-400
    },
    iconTheme: { primary: '#008080', secondary: '#f0fafa' },
  },

  error: {
    ...base,
    duration: 5000,
    style: {
      ...base.style,
      background: '#fff5f5',
      color: '#c53030',
      border: '1.5px solid #feb2b2',
    },
    iconTheme: { primary: '#e53e3e', secondary: '#fff5f5' },
  },

  loading: {
    ...base,
    duration: Infinity,
    style: {
      ...base.style,
      background: '#f8fafc',           // slate-50
      color: '#334155',           // slate-700
      border: '1.5px solid #e2e8f0',
    },
    iconTheme: { primary: '#008080', secondary: '#f8fafc' },
  },

  info: {
    ...base,
    style: {
      ...base.style,
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1.5px solid #bfdbfe',
    },
    icon: 'ℹ️',
  },

  warning: {
    ...base,
    style: {
      ...base.style,
      background: '#fffbeb',
      color: '#92400e',
      border: '1.5px solid #fcd34d',
    },
    icon: '⚠️',
  },
};

// ── Public API ────────────────────────────────────────────────────────────────
export const gstToast = {
  success: (msg, opts) => toast.success(msg, { ...variants.success, ...opts }),
  error: (msg, opts) => toast.error(msg, { ...variants.error, ...opts }),
  loading: (msg, opts) => toast.loading(msg, { ...variants.loading, ...opts }),
  info: (msg, opts) => toast(msg, { ...variants.info, ...opts }),
  warning: (msg, opts) => toast(msg, { ...variants.warning, ...opts }),

  /**
   * Async promise toast — shows loading → success/error automatically.
   * gstToast.promise(apiCall(), { loading: 'Saving…', success: 'Saved!', error: 'Failed.' });
   */
  promise: (promise, msgs, opts) =>
    toast.promise(promise, msgs, {
      loading: variants.loading,
      success: variants.success,
      error: variants.error,
      ...opts,
    }),

  /** Dismiss a specific or all toasts */
  dismiss: (id) => toast.dismiss(id),
};

export default gstToast;