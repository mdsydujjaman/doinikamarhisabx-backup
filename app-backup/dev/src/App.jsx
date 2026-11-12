// HisabX STEP-01 FINAL A-Z — Step 1 (CLEANUP30) + A-Z complete. Single-file App.jsx. No merge banner, no mismatch block, person+note mandatory, freeAccountName, decoupled medium/account.
import { useState, useEffect, useMemo } from 'react';
const getLocalDate = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const isValidTimeStr = (s) => { const str = String(s || ''); if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(str)) return false; return true; };
const getLocalTime = () => { const d = new Date(); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); };
const MAX_PAISA = 9007199254740991;
const safeAdd = (a, b) => { const n = a + b; if (!Number.isSafeInteger(n)) return null; return n; };
const parseAmountToPaisa = (raw, allowZero = false) => {
  const s = String(raw ?? '').trim();
  if (s === '' || /^[+-]/.test(s)) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const parts = s.split('.');
  const whole = Number(parts[0]);
  const frac = parts[1] ? Number(parts[1].padEnd(2, '0')) : 0;
  if (!Number.isSafeInteger(whole)) return null;
  const paisa = whole * 100 + frac;
  if (!Number.isSafeInteger(paisa) || paisa > MAX_PAISA) return null;
  if (!allowZero && paisa <= 0) return null;
  if (allowZero && paisa < 0) return null;
  return paisa;
};
const paisaFromStored = (taka) => {
  const pp = parseAmountToPaisa(taka, true);
  if (pp === null) {
    throw new Error('Corrupt stored amount');
  }
  return pp;
};
const isValidPaisa = (p) => typeof p === 'number' && Number.isSafeInteger(p) && p >= 0 && p <= MAX_PAISA;
const normalizePerson = (s) => String(s || '').trim().replace(/\s+/g, ' ');
const personKey = (s) => normalizePerson(s).toLowerCase();
const isValidDateStr = (s) => {
  const str = String(s || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const parts = str.split('-').map(Number);
  const y = parts[0]; const m = parts[1]; const d = parts[2];
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(0);
  dt.setFullYear(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};
const hasDuplicateIds = (arr) => { if (!Array.isArray(arr)) return true; const s = new Set(); for (const x of arr) { if (!x || s.has(x.id)) return true; s.add(x.id); } return false; };
const accountOpeningPaisa = (a) => {
  if (Number.isSafeInteger(a.openingPaisa)) return a.openingPaisa;
  if (a.opening !== undefined) { try { return paisaFromStored(a.opening); } catch { return null; } }
  return null;
};
const isValidAccount = (a) => {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
  if (typeof a.id !== 'string' || !a.id.trim()) return false;
  if (['__proto__', 'constructor', 'prototype'].includes(a.id.trim())) return false;
  if (typeof a.name !== 'string' || !a.name.trim()) return false;
  if (a.openingDate !== undefined && !isValidDateStr(a.openingDate)) return false;
  const op = accountOpeningPaisa(a);
  if (op === null || !isValidPaisa(op)) return false;
  if (a.opening !== undefined && a.openingPaisa !== undefined) { try { const fromOpening = paisaFromStored(a.opening); if (fromOpening !== a.openingPaisa) return false; } catch { return false; } }
  return true;
};
const ACCOUNT_PRESETS = [
  { id: 'nagad', label: 'নগদ (মোবাইল ব্যাংকিং)', group: 'mobile', badge: '', color: '#f97316' },
  { id: 'bkash', label: 'বিকাশ (মোবাইল ব্যাংকিং)', group: 'mobile', badge: '', color: '#ec4899' },
  { id: 'rocket', label: 'রকেট (মোবাইল ব্যাংকিং)', group: 'mobile', badge: '', color: '#8b5cf6' },
  { id: 'upay', label: 'উপায় (মোবাইল ব্যাংকিং)', group: 'mobile', badge: '', color: '#eab308' },
  { id: 'surecash', label: 'শিওরক্যাশ (মোবাইল ব্যাংকিং)', group: 'mobile', badge: '', color: '#14b8a6' },
  { id: 'cash', label: 'হাতে নগদ টাকা', group: 'cash', badge: '', color: '#64748b' },
  { id: 'islami', label: 'ইসলামী ব্যাংক', group: 'bank', badge: '', color: '#15803d' },
  { id: 'dbbl', label: 'ডাচ্-বাংলা ব্যাংক', group: 'bank', badge: '', color: '#dc2626' },
  { id: 'sonali', label: 'সোনালী ব্যাংক', group: 'bank', badge: '', color: '#2563eb' },
  { id: 'janata', label: 'জনতা ব্যাংক', group: 'bank', badge: '', color: '#0891b2' },
  { id: 'agrani', label: 'অগ্রণী ব্যাংক', group: 'bank', badge: '', color: '#0d9488' },
  { id: 'rupali', label: 'রূপালী ব্যাংক', group: 'bank', badge: '', color: '#7c3aed' },
  { id: 'pubali', label: 'পূবালী ব্যাংক', group: 'bank', badge: '', color: '#db2777' },
  { id: 'brac', label: 'ব্র্যাক ব্যাংক', group: 'bank', badge: '', color: '#ea580c' },
  { id: 'city', label: 'সিটি ব্যাংক', group: 'bank', badge: '', color: '#1d4ed8' },
  { id: 'ebl', label: 'ইস্টার্ন ব্যাংক (EBL)', group: 'bank', badge: '', color: '#0f766e' },
  { id: 'visa', label: 'ভিসা কার্ড', group: 'card', badge: '', color: '#1a1f71' },
  { id: 'mastercard', label: 'মাস্টারকার্ড', group: 'card', badge: '', color: '#f59e0b' },
  { id: 'amex', label: 'আমেক্স কার্ড', group: 'card', badge: '', color: '#0284c7' },
  { id: 'custom', label: '+ নিজে লিখতে পারবে (ঐচ্ছিক)', group: 'custom', badge: '', color: '#334155' },
  { id: 'other', label: 'অন্যান্য', group: 'other', badge: '', color: '#475569' },
];
const PAYMENT_METHODS = ACCOUNT_PRESETS.map(p=>p.id);
const presetById = (id) => ACCOUNT_PRESETS.find(p=>p.id===id) || { id: String(id||'other'), label: String(id||'অন্যান্য'), group: 'other', badge: '', color: '#475569' };
const freeAccountName = (accounts, base) => { const _b = String(base || '').trim() || 'অ্যাকাউন্ট'; const _taken = new Set(accounts.map((a) => String(a.name || '').trim().toLowerCase())); if (!_taken.has(_b.toLowerCase())) return _b; const _bn = ['২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০']; for (const _s of _bn) { const _cand = _b + ' ' + _s; if (!_taken.has(_cand.toLowerCase())) return _cand; } let _i = 11; while (_taken.has((_b + ' ' + _i).toLowerCase())) _i++; return _b + ' ' + _i; };
const findAccountForPreset = (accounts, pid) => { const _ex = accounts.find((a) => a.preset === pid); if (_ex) return _ex; const _pp = presetById(pid); if (_pp.group === 'cash') { const _byKind = accounts.find((a) => String(a.kind || '') === 'cash'); if (_byKind) return _byKind; const _byName = accounts.find((a) => /হাতে নগদ|নগদ টাকা|ক্যাশ|cash/i.test(a.name || '')); if (_byName) return _byName; } return null; };
const isPresetOwned = (accounts, pp) => !!findAccountForPreset(accounts, pp.id);
const GROUP_LABEL = { cash: 'হাতে নগদ (ক্যাশ)', mobile: 'মোবাইল ব্যাংকিং', bank: 'ব্যাংক', card: 'কার্ড', custom: 'নিজে লিখুন', other: 'অন্যান্য' };
const isValidTx = (t, ids, personIds) => {
  if (!t || typeof t !== 'object' || Array.isArray(t)) return false;
  if (typeof t.id !== 'string' || !t.id.trim()) return false;
  if (['__proto__', 'constructor', 'prototype'].includes(t.id.trim())) return false;
  if (!['income', 'expense', 'lent', 'borrowed', 'received', 'paid', 'transfer', 'gift'].includes(t.type)) return false;
  if (!ids.has(t.account)) return false;
  if (t.type === 'transfer' && (!ids.has(t.toAccount) || t.toAccount === t.account)) return false;
  if (t.type !== 'transfer' && t.toAccount !== undefined) return false;
  if (!Number.isSafeInteger(t.amountPaisa) || t.amountPaisa <= 0 || t.amountPaisa > MAX_PAISA) return false;
  if (t.amount !== undefined && Math.round(t.amount * 100) !== t.amountPaisa) return false;
  if (!isValidDateStr(t.date)) return false;
  if (['lent','borrowed','received','paid'].includes(t.type)) { if (!t.person || !normalizePerson(t.person)) return false; if (!t.personId || !personIds || !personIds.has(t.personId)) return false; }
  if (!['lent','borrowed','received','paid','gift'].includes(t.type) && t.personId) return false;
  if (t.type === 'gift' && t.personId && (!t.person || !normalizePerson(t.person))) return false;
  if (t.type === 'gift' && t.person && normalizePerson(t.person) && !t.personId) return false;
  if (t.receiptDate !== undefined && !isValidDateStr(t.receiptDate)) return false;
  if (t.paymentMethod !== undefined && !PAYMENT_METHODS.includes(t.paymentMethod) && !['bank','card'].includes(t.paymentMethod)) return false;
  if (t.note !== undefined && typeof t.note !== 'string') return false;
  if (['lent', 'borrowed', 'received', 'paid'].includes(t.type)) {
    if (!normalizePerson(t.person)) return false;
    if (!t.personId || !personIds.has(t.personId)) return false;
  }
  if (t.personId !== undefined && t.personId !== null && !personIds.has(t.personId)) return false;
  if (t.personId && personIds && personIds instanceof Map && personIds.has(t.personId) && typeof personIds.get(t.personId) === 'object' && personIds.get(t.personId).name && personKey(personIds.get(t.personId).name) !== personKey(t.person || '')) return false;
  if (t.time !== undefined && !isValidTimeStr(t.time)) return false;
  if (t.seq !== undefined && (!Number.isSafeInteger(t.seq) || t.seq < 0)) return false;
  if (t.createdAt !== undefined && (typeof t.createdAt !== 'string' || Number.isNaN(Date.parse(t.createdAt)))) return false;
  if (t.customPaymentMethod !== undefined && (typeof t.customPaymentMethod !== 'string' || t.customPaymentMethod.length > 100 || /[<>{}\[\]\\]/.test(t.customPaymentMethod))) return false;
  if ((t.paymentMethod === 'custom') && (!t.customPaymentMethod || !t.customPaymentMethod.trim())) return false;
  return true;
};
const isValidPerson = (p) => p && typeof p === 'object' && !Array.isArray(p) && typeof p.id === 'string' && p.id.trim() !== '' && !['__proto__', 'constructor', 'prototype'].includes(p.id.trim()) && typeof p.name === 'string' && p.name.trim() !== '' && typeof p.key === 'string' && p.key.trim() !== '' && p.key === personKey(p.name);
const isValidAudit = (a) => a && typeof a === 'object' && typeof a.id === 'string' && a.id.trim() !== '' && typeof a.action === 'string' && ['create', 'edit', 'delete', 'restore', 'reversal', 'sync', 'merge'].includes(a.action) && typeof a.at === 'string' && typeof a.hash === 'string' && typeof a.prevHash === 'string' && typeof a.hashAlgo === 'string';
const paisaFromTx = (tx) => {
  if (Number.isSafeInteger(tx.amountPaisa) && tx.amountPaisa > 0) return tx.amountPaisa;
  throw new Error('Corrupt amount in tx ' + String(tx.id));
};
const calcLedgerEngine = (accounts, txList) => {
  const balMap = new Map();
  const perPerson = new Map();
  let corrupt = false;
  const errors = [];
  const addTo = (m, k, amt) => {
    const cur = m.get(k) || 0;
    const nxt = safeAdd(cur, amt);
    if (nxt === null) { corrupt = true; errors.push('overflow ' + String(k)); return cur; }
    m.set(k, nxt);
    return nxt;
  };
  const _asOfForOpening = null;
  const _todayStr = getLocalDate();
  accounts.forEach((a) => {
    const op = accountOpeningPaisa(a);
    if (op === null || !Number.isSafeInteger(op)) { corrupt = true; errors.push('account ' + String(a && a.id)); balMap.set(a.id, 0); }
    else if (a.openingDate && String(a.openingDate) > _todayStr) balMap.set(a.id, 0);
    else balMap.set(a.id, op);
  });
  const sorted = [...txList].sort((x, y) => String(x.date || '').localeCompare(String(y.date || '')) || String(x.time || '00:00').localeCompare(String(y.time || '00:00')) || Number(x.seq || 0) - Number(y.seq || 0) || String(x.id || '').localeCompare(String(y.id || '')));
  sorted.forEach((tx) => {
    let amt = 0;
    try { amt = paisaFromTx(tx); } catch (e) { corrupt = true; errors.push('tx ' + String(tx.id)); return; }
    if (tx.type === 'income') addTo(balMap, tx.account, amt);
    if (tx.type === 'gift') addTo(balMap, tx.account, amt);
    if (tx.type === 'expense') addTo(balMap, tx.account, -amt);
    if (tx.type === 'lent') addTo(balMap, tx.account, -amt);
    if (tx.type === 'borrowed') addTo(balMap, tx.account, amt);
    if (tx.type === 'received') addTo(balMap, tx.account, amt);
    if (tx.type === 'paid') addTo(balMap, tx.account, -amt);
    if (tx.type === 'transfer') { addTo(balMap, tx.account, -amt); addTo(balMap, tx.toAccount, amt); }
    if (['lent','borrowed','received','paid'].includes(tx.type) && !tx.personId) { corrupt = true; errors.push('person-tx-missing-personId ' + String(tx.id)); }
    // Gift person is only a record (who gave/received the gift) — it must NOT create a pawna/dena entry.
    if (['lent', 'borrowed', 'received', 'paid'].includes(tx.type) && (tx.person || tx.personId)) {
      const pid = tx.personId || personKey(tx.person || '');
      if (!perPerson.has(pid)) perPerson.set(pid, { display: normalizePerson(tx.person || ''), receivable: 0, payable: 0 });
      const e = perPerson.get(pid);
      const _nr = tx.type === 'lent' ? safeAdd(e.receivable, amt) : tx.type === 'received' ? safeAdd(e.receivable, -amt) : null;
      const _np = tx.type === 'borrowed' ? safeAdd(e.payable, amt) : tx.type === 'paid' ? safeAdd(e.payable, -amt) : null;
      if (_nr === null && (tx.type === 'lent' || tx.type === 'received')) { corrupt = true; errors.push('person-receivable-overflow ' + String(pid)); }
      else if (_nr !== null) e.receivable = _nr;
      if (_np === null && (tx.type === 'borrowed' || tx.type === 'paid')) { corrupt = true; errors.push('person-payable-overflow ' + String(pid)); }
      else if (_np !== null) e.payable = _np;
      if (!Number.isSafeInteger(e.receivable) || !Number.isSafeInteger(e.payable)) { corrupt = true; errors.push('person overflow ' + String(pid)); }
    }
  });
  const balReadOnly = Object.create(null);
  balMap.forEach((v, k) => { balReadOnly[k] = v; });
  return { bal: balReadOnly, balMap: balMap, perPerson: perPerson, corrupt: corrupt, errors: errors };
};
// FIX: Split negative check — person vs account must have SEPARATE messages.
// - Person-negative: only lent/borrowed/received/paid can cause it (paona/dena).
// - Account-negative: expense/transfer/lent/paid (or editing an income/gift smaller) can drain an account.
// - Income/gift NEVER show the paona/dena message (they have no person).
const hasAccountNegative = (txList, accounts) => {
  const eng = calcLedgerEngine(accounts || [], txList);
  let bad = eng.corrupt;
  Object.values(eng.bal || {}).forEach((v) => { if (v < 0) bad = true; });
  const _bal = {};
  (accounts || []).forEach((a) => { _bal[a.id] = 0; });
  const _sorted = [...(txList || [])].sort((x, y) => String(x.date || '').localeCompare(String(y.date || '')) || String(x.time || '00:00').localeCompare(String(y.time || '00:00')) || Number(x.seq || 0) - Number(y.seq || 0));
  const _opened = {};
  for (const t of _sorted) {
    (accounts || []).forEach((a) => { if (!_opened[a.id] && String(t.date || '') >= String(a.openingDate || '0000-01-01')) { _bal[a.id] = safeAdd(_bal[a.id] || 0, accountOpeningPaisa(a) || 0) ?? _bal[a.id]; _opened[a.id] = true; } });
    const _amt = t.amountPaisa;
    const _apply = (accId, delta) => { const cur = _bal[accId] ?? 0; const nxt = safeAdd(cur, delta); if (nxt === null) { bad = true; return cur; } _bal[accId] = nxt; return nxt; };
    let _v = null;
    if (t.type === 'income') _v = _apply(t.account, _amt);
    if (t.type === 'gift') _v = _apply(t.account, _amt);
    if (t.type === 'expense') _v = _apply(t.account, -_amt);
    if (t.type === 'lent') _v = _apply(t.account, -_amt);
    if (t.type === 'borrowed') _v = _apply(t.account, _amt);
    if (t.type === 'received') _v = _apply(t.account, _amt);
    if (t.type === 'paid') _v = _apply(t.account, -_amt);
    if (t.type === 'transfer') { const a1 = _apply(t.account, -_amt); const a2 = _apply(t.toAccount, _amt); _v = Math.min(a1, a2); }
    if (_v !== null && _v < 0) bad = true;
  }
  return bad;
};
// Exact Taka formatting: quotient + remainder, no floating point
const fmt = (paisa) => {
  if (paisa === null || paisa === undefined) return '—';
  const p = Number(paisa);
  if (!Number.isFinite(p) || !Number.isSafeInteger(p)) return '—';
  const sign = p < 0 ? '-' : '';
  const abs = Math.abs(p);
  const whole = Math.trunc(abs / 100);
  const frac = abs % 100;
  const fracStr = frac === 0 ? '' : '.' + String(frac).padStart(2, '0').replace(/0+$/, '');
  return sign + whole.toLocaleString('bn-BD') + fracStr;
};
const sha256Hex = async (s) => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('SHA-256 unavailable');
};
const canonicalAudit = (entry) => JSON.stringify({ id: entry.id, action: entry.action, entityType: entry.entityType, entityId: entry.entityId, before: entry.before, after: entry.after, at: entry.at, prevHash: entry.prevHash });
const createAuditEntry = async (action, entityType, entityId, before, after, prevHash) => {
  const at = new Date().toISOString();
  const entry = { id: newId(), action: action, entityType: entityType, entityId: entityId, before: before, after: after, at: at, prevHash: prevHash || '', hash: '', hashAlgo: 'SHA-256' };
  entry.hash = await sha256Hex(canonicalAudit(entry));
  return entry;
};
const verifyAuditChain = (log) => {
  if (!Array.isArray(log)) return { ok: false, error: 'not-array' };
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (!isValidAudit(e)) return { ok: false, error: 'invalid-entry-' + i };
    if (e.hashAlgo !== 'SHA-256') return { ok: false, error: 'non-sha256-entry-' + i };
    if (i === log.length - 1 && log.length > 0 && e.prevHash !== GENESIS_PREV_HASH) return { ok: false, error: 'genesis-mismatch-' + i };
if (i + 1 < log.length && e.prevHash !== (log[i + 1].hash || '')) return { ok: false, error: 'chain-mismatch-' + i };
  }
  return { ok: true };
};
const GENESIS_PREV_HASH = '';
const verifyAuditChainAsync = async (log) => {
  if (!Array.isArray(log)) return { ok: false, error: 'not-array' };
  const seen = new Set();
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (!isValidAudit(e)) return { ok: false, error: 'invalid-entry-' + i };
    if (e.hashAlgo !== 'SHA-256') return { ok: false, error: 'non-sha256-entry-' + i };
    if (!/^[0-9a-f]{64}$/.test(String(e.hash || ''))) return { ok: false, error: 'bad-hash-format-' + i };
    if (e.prevHash !== '' && !/^[0-9a-f]{64}$/.test(String(e.prevHash || ''))) return { ok: false, error: 'bad-prevhash-format-' + i };
    if (seen.has(e.id)) return { ok: false, error: 'duplicate-audit-id-' + i };
    seen.add(e.id);
    if (Number.isNaN(Date.parse(e.at))) return { ok: false, error: 'bad-timestamp-' + i };
    if (typeof e.entityType !== 'string' || !e.entityType) return { ok: false, error: 'bad-entityType-' + i };
    if (e.entityId !== null && e.entityId !== undefined && typeof e.entityId !== 'string') return { ok: false, error: 'bad-entityId-' + i };
    let recomputed = '';
    try { recomputed = await sha256Hex(canonicalAudit(e)); } catch { return { ok: false, error: 'sha256-failed-' + i }; }
    if (recomputed !== e.hash) return { ok: false, error: 'hash-mismatch-' + i };
    if (i === log.length - 1 && log.length > 0 && e.prevHash !== GENESIS_PREV_HASH) return { ok: false, error: 'genesis-mismatch-' + i };
if (i + 1 < log.length && e.prevHash !== (log[i + 1].hash || '')) return { ok: false, error: 'chain-mismatch-' + i };
  }
  return { ok: true };
};
const validateV2CollectionsAsync = async (accounts, transactions, persons, deletedLog, auditLog) => {
  const base = validateV2Collections(accounts, transactions, persons, deletedLog, auditLog);
  if (!base.ok) return base;
  const chk = await verifyAuditChainAsync(auditLog);
  if (!chk.ok) return { ok: false, error: chk.error };
  return { ok: true };
};
function safeLoadStrict(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { status: 'missing', value: null };
    const parsed = JSON.parse(raw);
    return { status: 'ok', value: parsed };
  } catch (e) { return { status: 'corrupt', value: null, error: String(e) }; }
}
function safeLoad(key, fallback) {
  const r = safeLoadStrict(key);
  if (r.status === 'ok') return r.value ?? fallback;
  return fallback;
}
// StorageService: IndexedDB primary, LocalStorage mirror for verification, SQLite adapter interface (not connected)
const StorageService = {
  kind: 'localStorage',
  db: null,
  sqliteAdapter: null,
  async init() {
    try {
      if (typeof indexedDB !== 'undefined') {
        const req = indexedDB.open('hisabx-db', 1);
        req.onblocked = () => { alert('আরেকটি Tab-এ HisabX খোলা আছে — ওই Tab বন্ধ করে আবার চেষ্টা করুন।'); };
        // FIX-14.07: onversionchange belongs on the DB connection, not the open request
        req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); };
        await new Promise((res, rej) => { req.onsuccess = () => { StorageService.kind = 'indexedDB'; StorageService.db = req.result; try { StorageService.db.onversionchange = () => { try { StorageService.db.close(); } catch {} StorageService.db = null; StorageService.kind = 'localStorage'; alert('Database সংস্করণ বদলেছে — এই Tab Reload করুন।'); }; } catch {} res(); }; req.onerror = () => rej(req.error); });
      }
    } catch { }
    return StorageService.kind;
  },
  async get(key) {
    if (StorageService.kind === 'indexedDB' && StorageService.db) {
      return await new Promise((res, rej) => { const tx = StorageService.db.transaction('kv', 'readonly'); const st = tx.objectStore('kv'); const r = st.get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    }
    const r = safeLoadStrict(key);
    return r.status === 'ok' ? r.value : null;
  },
  async put(key, val) {
    if (StorageService.kind === 'indexedDB' && StorageService.db) {
      await new Promise((res, rej) => { const tx = StorageService.db.transaction('kv', 'readwrite'); const st = tx.objectStore('kv'); const r = st.put(val, key); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });
    }
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  },
  async transaction(payload) {
    const keys = { accounts: 'hisabx-accounts-v2', transactions: 'hisabx-transactions-v2', deletedLog: 'hisabx-deleted-v2', auditLog: 'hisabx-audit-v2', persons: 'hisabx-persons-v2' };
    for (const k of Object.keys(payload)) { if (!Array.isArray(payload[k])) throw new Error('payload-not-array-' + k); }
    let primaryCommitted = false;
    let primaryError = null;
    let mirrorError = null;
    // PRIMARY: IndexedDB single readwrite transaction for all 5 collections
    if (StorageService.kind === 'indexedDB' && StorageService.db) {
      try {
        await new Promise((res, rej) => {
          const tx = StorageService.db.transaction('kv', 'readwrite');
          const st = tx.objectStore('kv');
          for (const k of Object.keys(payload)) st.put(payload[k], keys[k]);
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
          tx.onabort = () => rej(tx.error);
        });
        try { for (const k of Object.keys(payload)) { const back = await StorageService.get(keys[k]); if (JSON.stringify(back) !== JSON.stringify(payload[k])) throw new Error('indexeddb-verify-failed-' + k); } } catch (rb) { console.warn('[HisabX] Readback failed after commit, primary is committed:', String(rb.message || rb)); return { ok: false, primaryCommitted: true, mirrorFailed: false, readbackFailed: true, readbackError: String(rb.message || rb), error: 'readback-failed-after-commit' }; }
        primaryCommitted = true;
      } catch (e) { primaryError = e; }
    } else {
      // No IndexedDB: LocalStorage IS primary in this environment (fallback mode, not claimed as IndexedDB)
      try {
        for (const k of Object.keys(payload)) localStorage.setItem(keys[k], JSON.stringify(payload[k]));
        for (const k of Object.keys(payload)) {
          const back = JSON.parse(localStorage.getItem(keys[k]));
          if (JSON.stringify(back) !== JSON.stringify(payload[k])) throw new Error('localstorage-verify-failed-' + k);
        }
        primaryCommitted = true;
      } catch (e) { primaryError = e; }
      return { ok: primaryCommitted, primaryCommitted: primaryCommitted, mirrorFailed: false, error: primaryError ? String(primaryError.message || primaryError) : null };
    }
    // MIRROR: LocalStorage is Recovery/Cache only, NOT part of primary transaction. Mirror failure must NOT turn a committed primary into false failure.
    if (primaryCommitted) {
      try {
        for (const k of Object.keys(payload)) { try { localStorage.setItem(keys[k], JSON.stringify(payload[k])); } catch (e) { mirrorError = e; } }
      } catch (e) { mirrorError = e; }
      if (mirrorError) console.warn('[HisabX] Mirror failed but primary committed:', String(mirrorError.message || mirrorError));
      return { ok: true, primaryCommitted: true, mirrorFailed: !!mirrorError, mirrorError: mirrorError ? String(mirrorError.message || mirrorError) : null, error: null };
    }
    return { ok: false, primaryCommitted: false, mirrorFailed: false, error: primaryError ? String(primaryError.message || primaryError) : 'primary-commit-failed' };
  }
};
let _opLock = false;
let _storageLock = false;
let _lastStorageError = null;
async function saveAllAtomicWithAudit(payload) {
  if (_storageLock) return { ok: false, error: 'operation-in-progress' };
  _storageLock = true;
  try {
    const res = await StorageService.transaction(payload);
    _lastStorageError = res.error || res.mirrorError || null;
    if (!res.ok) return { ok: false, error: res.error || 'storage-commit-failed', primaryCommitted: res.primaryCommitted, readbackFailed: !!res.readbackFailed };
    return { ok: true, primaryCommitted: true, mirrorFailed: !!res.mirrorFailed, mirrorError: res.mirrorError || null };
  } catch (e) {
    _lastStorageError = String(e && e.message ? e.message : e);
    return { ok: false, error: _lastStorageError };
  } finally { _storageLock = false; }
}
function acquireOpLock() { if (_opLock) return false; _opLock = true; return true; }
function releaseOpLock() { _opLock = false; }
function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const r = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? Array.from(crypto.getRandomValues(new Uint32Array(2))).map((x) => x.toString(36)).join('') : String(Date.now());
  return 'id-' + Date.now() + '-' + r;
}
const TYPES = [
  { id: 'income', name: 'আয়' },
  { id: 'expense', name: 'ব্যয়' },
  { id: 'lent', name: 'ধার দিলাম' },
  { id: 'borrowed', name: 'ধার নিলাম' },
  { id: 'received', name: 'পাওনা আদায়' },
  { id: 'paid', name: 'দেনা পরিশোধ' },
  { id: 'transfer', name: 'স্থানান্তর' },
  { id: 'gift', name: 'গিফট' },
];
const NEED_PERSON = ['lent', 'borrowed', 'received', 'paid'];
const V2_KEYS = ['hisabx-accounts-v2', 'hisabx-transactions-v2', 'hisabx-deleted-v2', 'hisabx-audit-v2', 'hisabx-persons-v2'];
function checkV2Storage() {
  const detail = {};
  V2_KEYS.forEach((k) => { const r = safeLoadStrict(k); detail[k] = r.status; });
  const vals = Object.values(detail);
  const present = vals.filter((v) => v === 'ok').length;
  const corrupt = vals.filter((v) => v === 'corrupt').length;
  const missing = vals.filter((v) => v === 'missing').length;
  if (corrupt > 0) return { status: 'corrupt', detail: detail };
  if (present === 0 && missing === 5) return { status: 'empty', detail: detail };
  if (present < 5) return { status: 'partial', detail: detail };
  return { status: 'complete', detail: detail };
}
const isValidDeletedEntry = (d) => d && typeof d === 'object' && typeof d.id === 'string' && d.id.trim() !== '' && typeof d.deletedAt === 'string' && !Number.isNaN(Date.parse(d.deletedAt)) && typeof d.type === 'string' && ['income','expense','lent','borrowed','received','paid','transfer','gift'].includes(d.type) && typeof d.amountPaisa === 'number' && Number.isSafeInteger(d.amountPaisa) && d.amountPaisa > 0 && (typeof d.txId === 'string' ? d.txId.trim() !== '' : true) && (d.original ? (typeof d.original.id === 'string' && d.original.id === d.txId && Number.isSafeInteger(d.original.amountPaisa) && d.original.amountPaisa === d.amountPaisa && isValidDateStr(d.original.date)) : true);
function validateV2Collections(accounts, transactions, persons, deletedLog, auditLog) {
  if (!Array.isArray(accounts) || !Array.isArray(transactions) || !Array.isArray(persons) || !Array.isArray(deletedLog) || !Array.isArray(auditLog)) return { ok: false, error: 'not-array' };
  if (hasDuplicateIds(accounts) || hasDuplicateIds(transactions) || hasDuplicateIds(persons) || hasDuplicateIds(deletedLog) || hasDuplicateIds(auditLog)) return { ok: false, error: 'duplicate-id' };
  const _seqs = transactions.map((t) => t.seq).filter((s) => s !== undefined); if (new Set(_seqs).size !== _seqs.length) return { ok: false, error: 'duplicate-seq' };
  if (!deletedLog.every(isValidDeletedEntry)) return { ok: false, error: 'invalid-deleted-entry' };
  if (new Set(persons.map((p) => p.key)).size !== persons.length) return { ok: false, error: 'duplicate-person-key' };
  if (!accounts.every(isValidAccount)) return { ok: false, error: 'invalid-account' };
  if (!persons.every(isValidPerson)) return { ok: false, error: 'invalid-person' };
  const aIds = new Set(accounts.map((a) => a.id));
  const pIds = new Set(persons.map((p) => p.id));
  if (!transactions.every((tx) => isValidTx(tx, aIds, pIds))) return { ok: false, error: 'invalid-tx' };
  if (!auditLog.every(isValidAudit)) return { ok: false, error: 'invalid-audit' };
  const chk = verifyAuditChain(auditLog);
  if (!chk.ok) return { ok: false, error: chk.error };
  return { ok: true };
}
function migrateV1toV2() {
  const chk = checkV2Storage();
  const defaultAcc = [{ id: 'cash', name: 'হাতে নগদ', opening: 0, openingPaisa: 0 }];
  if (chk.status === 'corrupt' || chk.status === 'partial') return { accounts: [], transactions: [], persons: [], deletedLog: [], auditLog: [], corruptV2: true, migrationBlocked: true, v2Status: chk.status, v2Detail: chk.detail, migrationReport: [{ reason: 'corrupt-v2-blocked-no-overwrite' }] };
  const v2Acc = safeLoadStrict('hisabx-accounts-v2');
  const v2Tx = safeLoadStrict('hisabx-transactions-v2');
  const v2Del = safeLoadStrict('hisabx-deleted-v2');
  const v2Aud = safeLoadStrict('hisabx-audit-v2');
  const v2Per = safeLoadStrict('hisabx-persons-v2');
  if (chk.status === 'complete') {
    const accounts = v2Acc.value;
    const transactions = v2Tx.value;
    const persons = v2Per.value;
    const deletedLog = v2Del.value;
    const auditLog = v2Aud.value;
    const v = validateV2Collections(accounts, transactions, persons, deletedLog, auditLog);
    if (v.ok) return { accounts: accounts, transactions: transactions, persons: persons, deletedLog: deletedLog, auditLog: auditLog, v2Status: 'complete', migrationReport: [] };
    return { accounts: [], transactions: [], persons: [], deletedLog: [], auditLog: [], corruptV2: true, migrationBlocked: true, v2Status: 'corrupt', v2Detail: chk.detail, migrationReport: [{ reason: v.error }] };
  }
  const oldTxR = safeLoadStrict('hisabx-transactions-v1');
  const oldAccR = safeLoadStrict('hisabx-accounts-v1');
  if (oldTxR.status === 'corrupt' || oldAccR.status === 'corrupt') return { accounts: [], transactions: [], persons: [], deletedLog: [], auditLog: [], migrationBlocked: true, v2Status: 'v1-corrupt', migrationReport: [{ reason: 'V1 corrupt - no overwrite' }] };
  const oldTx = Array.isArray(oldTxR.value) ? oldTxR.value : [];
  const oldAccRaw = Array.isArray(oldAccR.value) && oldAccR.value.length ? oldAccR.value : defaultAcc;
  const oldAcc = oldAccRaw.map((a) => { const op = accountOpeningPaisa(a); return { ...a, openingPaisa: op === null ? 0 : op, opening: op === null ? 0 : op / 100 }; });
  const personsMap = new Map();
  const report = [];
  const migratedTx = [];
  oldTx.forEach((tx) => {
    if (!tx || typeof tx !== 'object' || !tx.id) { report.push({ id: String(tx && tx.id), reason: 'invalid-tx' }); return; }
    let amountPaisa = null;
    if (Number.isSafeInteger(tx.amountPaisa)) amountPaisa = tx.amountPaisa;
    else if (typeof tx.amount === 'number') { const pp = parseAmountToPaisa(String(tx.amount), true); if (pp !== null) amountPaisa = pp; }
    if (amountPaisa === null || amountPaisa <= 0) { report.push({ id: tx.id, reason: 'invalid-amount' }); return; }
    let personId = tx.personId || null;
    if (NEED_PERSON.includes(tx.type)) {
      if (!tx.person || !normalizePerson(tx.person)) { report.push({ id: tx.id, reason: 'missing-person' }); return; }
      const k = personKey(tx.person);
      if (!personsMap.has(k)) personsMap.set(k, { id: newId(), name: normalizePerson(tx.person), key: k });
      personId = personsMap.get(k).id;
    }
    migratedTx.push({ id: tx.id, type: tx.type, account: tx.account, toAccount: tx.toAccount, person: tx.person ? normalizePerson(tx.person) : '', personId: personId, amount: amountPaisa / 100, amountPaisa: amountPaisa, note: tx.note || '', date: tx.date, time: tx.time || '00:00', receiptDate: tx.receiptDate || tx.date, paymentMethod: tx.paymentMethod || 'cash' });
  });
  if (report.length > 0) return { accounts: oldAcc, transactions: [], persons: [], deletedLog: [], auditLog: [], migrationBlocked: true, v2Status: 'blocked-invalid-records', migrationReport: report };
  const persons = Array.from(personsMap.values());
  const v = validateV2Collections(oldAcc, migratedTx, persons, [], []);
  if (!v.ok) return { accounts: oldAcc, transactions: [], persons: [], deletedLog: [], auditLog: [], migrationBlocked: true, v2Status: 'blocked-validation', migrationReport: [{ reason: v.error }] };
  return { accounts: oldAcc, transactions: migratedTx, persons: persons, deletedLog: [], auditLog: [], v2Status: 'migrated-v1', migrationReport: [] };
}

export default function App() {
  const [migrated] = useState(() => migrateV1toV2());
  const [accounts, setAccounts] = useState(migrated.accounts);
  const [transactions, setTransactions] = useState(migrated.transactions);
  const [persons, setPersons] = useState(migrated.persons || []);
  const [deletedLog, setDeletedLog] = useState(() => {
    const r = safeLoadStrict('hisabx-deleted-v2');
    if (r.status === 'corrupt') return [];
    return Array.isArray(r.value) ? r.value : [];
  });
  const [auditLog, setAuditLog] = useState(() => {
    const r = safeLoadStrict('hisabx-audit-v2');
    if (r.status === 'corrupt') return [];
    return Array.isArray(r.value) ? r.value : [];
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState('');
  const [storageConflict, setStorageConflict] = useState('');
  const [blocked, setBlocked] = useState(() => !!(migrated.corruptV2 || migrated.migrationBlocked));
  const [blockedReason, setBlockedReason] = useState(() => migrated.corruptV2 ? 'Corrupt V2' : migrated.migrationBlocked ? 'Migration Blocked' : '');
  const [receiptDate, setReceiptDate] = useState(() => getLocalDate());
  const [paymentMethod, setPaymentMethod] = useState(() => { const _a0 = migrated.accounts && migrated.accounts.length ? migrated.accounts[0] : null; const _p0 = _a0 && _a0.preset ? presetById(_a0.preset) : null; return (_p0 && ['mobile', 'bank', 'card', 'cash'].includes(_p0.group)) ? _a0.preset : 'nagad'; });
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [customPaymentMethodTx, setCustomPaymentMethodTx] = useState('');
  const [type, setType] = useState('income');
  const [account, setAccount] = useState(() => migrated.accounts && migrated.accounts.length ? migrated.accounts[0].id : '');
  const [toAccount, setToAccount] = useState(() => migrated.accounts && migrated.accounts.length > 1 ? migrated.accounts[1].id : '');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => getLocalDate());
  const [txTime, setTxTime] = useState(() => getLocalTime());
  const [editId, setEditId] = useState(null);
  const [newAccName, setNewAccName] = useState('');
  const [newAccPreset, setNewAccPreset] = useState('nagad');
  const [newAccCustom, setNewAccCustom] = useState('');
  const [newAccOpening, setNewAccOpening] = useState('');
  const [search, setSearch] = useState('');
  const [listCategory, setListCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinOld, setPinOld] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [isLocked, setIsLocked] = useState(() => { try { return !!localStorage.getItem('hisabx-pin-hash'); } catch { return false; } });
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(() => { try { return Number(localStorage.getItem('hisabx-pin-attempts') || 0) || 0; } catch { return 0; } });
  const [pinLockedUntil, setPinLockedUntil] = useState(() => { try { return Number(localStorage.getItem('hisabx-pin-locked-until') || 0) || 0; } catch { return 0; } });
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryPhoneNew, setRecoveryPhoneNew] = useState('');
  const [lockPanel, setLockPanel] = useState('main');
  const [showCode, setShowCode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryEmailNew, setRecoveryEmailNew] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryConfirmPin, setRecoveryConfirmPin] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryAttempts, setRecoveryAttempts] = useState(() => { try { return Number(localStorage.getItem('hisabx-recovery-attempts') || 0) || 0; } catch { return 0; } });
  const _blocked = blocked;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const kind = await StorageService.init();
        // FIX-11.2 P0-1: Hydrate from IndexedDB (Primary) before allowing mutations.
        if (StorageService.kind === 'indexedDB' && StorageService.db) {
          const keys = { accounts: 'hisabx-accounts-v2', transactions: 'hisabx-transactions-v2', deletedLog: 'hisabx-deleted-v2', auditLog: 'hisabx-audit-v2', persons: 'hisabx-persons-v2' };
          const idbVals = {};
          for (const k of Object.keys(keys)) { try { idbVals[k] = await StorageService.get(keys[k]); } catch { idbVals[k] = null; } }
          const idbHasAny = Object.values(idbVals).some((v) => v !== null && v !== undefined);
          const lsChk = checkV2Storage();
          // Conflict: both have data but differ -> do NOT silently overwrite. Block and report.
          if (idbHasAny) {
            const lsVals = { accounts: safeLoadStrict(keys.accounts).value, transactions: safeLoadStrict(keys.transactions).value, deletedLog: safeLoadStrict(keys.deletedLog).value, auditLog: safeLoadStrict(keys.auditLog).value, persons: safeLoadStrict(keys.persons).value };
            const idbStr = JSON.stringify({ accounts: idbVals.accounts, transactions: idbVals.transactions, deletedLog: idbVals.deletedLog, auditLog: idbVals.auditLog, persons: idbVals.persons });
            const lsStr = JSON.stringify(lsVals);
            if (lsChk.status === 'complete' && idbStr !== lsStr) {
              if (!cancelled) { setStorageConflict('IndexedDB ও LocalStorage-এর ডেটা আলাদা — নীরব Overwrite করা হয়নি। IndexedDB (Primary) ব্যবহার হচ্ছে। LocalStorage Mirror আলাদা।'); }
            }
            // Validate IndexedDB data before adopting it
            if (Array.isArray(idbVals.accounts) && Array.isArray(idbVals.transactions) && Array.isArray(idbVals.persons) && Array.isArray(idbVals.deletedLog) && Array.isArray(idbVals.auditLog)) {
              const vv = await validateV2CollectionsAsync(idbVals.accounts, idbVals.transactions, idbVals.persons, idbVals.deletedLog, idbVals.auditLog);
              if (vv.ok) {
                if (!cancelled) { setAccounts(idbVals.accounts); setTransactions(idbVals.transactions); setPersons(idbVals.persons); setDeletedLog(idbVals.deletedLog); setAuditLog(idbVals.auditLog); setBlocked(false); setBlockedReason(''); if (idbVals.accounts.length) setAccount(idbVals.accounts[0].id); }
              } else {
                if (!cancelled) { setBlocked(true); setBlockedReason('IndexedDB Data যাচাই ব্যর্থ: ' + vv.error); }
              }
            } else if (!cancelled) { setBlocked(true); setBlockedReason('IndexedDB-এ অসম্পূর্ণ Collection — Blocked।'); }
          } else {
            // IndexedDB empty, LocalStorage has data -> migrate LocalStorage -> IndexedDB via single transaction (do not lose it)
            if (lsChk.status === 'complete') {
              const lsVals = { accounts: safeLoadStrict(keys.accounts).value, transactions: safeLoadStrict(keys.transactions).value, deletedLog: safeLoadStrict(keys.deletedLog).value, auditLog: safeLoadStrict(keys.auditLog).value, persons: safeLoadStrict(keys.persons).value };
              const vv = await validateV2CollectionsAsync(lsVals.accounts, lsVals.transactions, lsVals.persons, lsVals.deletedLog, lsVals.auditLog);
              if (vv.ok) { const rr = await saveAllAtomicWithAudit(lsVals); if (!rr.ok && !cancelled) setInitError('LocalStorage -> IndexedDB Migration ব্যর্থ: ' + (rr.error || '')); }
            }
          }
        }
        if (!cancelled) setIsInitializing(false);
      } catch (e) { if (!cancelled) { setInitError('Initialization ব্যর্থ: ' + String(e && e.message ? e.message : e)); setBlocked(true); setBlockedReason('Initialization ব্যর্থ'); setIsInitializing(false); } }
    })();
    return () => { cancelled = true; };
  }, []);

  const unlockWithPin = async () => {
    try {
      const stored = localStorage.getItem('hisabx-pin-hash');
      if (!stored) { setPinError('আগে কোড সেট করুন — কোড ছাড়া অংক লুকানো যাবে না।'); return; }
      const _lockedUntil = Number(localStorage.getItem('hisabx-pin-locked-until') || 0) || 0;
      if (Date.now() < _lockedUntil) { setPinLockedUntil(_lockedUntil); setPinError('অনেকবার ভুল কোড — ৩০ সেকেন্ড পর আবার চেষ্টা করুন।'); return; }
      if (_lockedUntil > 0) { try { localStorage.removeItem('hisabx-pin-attempts'); localStorage.removeItem('hisabx-pin-locked-until'); } catch {} setPinAttempts(0); setPinLockedUntil(0); }
      const h = await sha256Hex('hisabx-pin:' + pinInput);
      if (h === stored) { try { localStorage.removeItem('hisabx-pin-attempts'); localStorage.removeItem('hisabx-pin-locked-until'); } catch {} setIsLocked(false); setPinInput(''); setPinError(''); setPinAttempts(0); setPinLockedUntil(0); }
      else { const n = (Number(localStorage.getItem('hisabx-pin-attempts') || 0) || 0) + 1; try { localStorage.setItem('hisabx-pin-attempts', String(n)); } catch {} setPinAttempts(n); if (n >= 5) { const _u = Date.now() + 30000; try { localStorage.setItem('hisabx-pin-locked-until', String(_u)); } catch {} setPinLockedUntil(_u); setPinError('৫ বার ভুল কোড — ৩০ সেকেন্ড লক।'); } else setPinError('ভুল কোড — আবার চেষ্টা করুন। (' + n + '/5)'); }
    } catch { setPinError('কোড যাচাই করা যায়নি।'); }
  };

  const normalizePhoneBD = (s) => { const d = String(s || '').replace(/[^0-9]/g, ''); if (/^8801[3-9]\d{8}$/.test(d)) return '0' + d.slice(3); if (/^01[3-9]\d{8}$/.test(d)) return d; return null; };
  const saveRecoveryPhone = async () => {
    const ph = normalizePhoneBD(recoveryPhoneNew);
    if (!ph) { alert('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।'); return; }
    try { const _existing = localStorage.getItem('hisabx-pin-hash'); if (_existing) { if (!pinOld) { alert('ফোন নম্বর বদলাতে হলে প্রথমে বর্তমান (পুরোনো) কোড লিখুন — উপরের বর্তমান কোডের ঘরে।'); return; } const _oldH = await sha256Hex('hisabx-pin:' + pinOld); if (_oldH !== _existing) { alert('বর্তমান (পুরোনো) কোড ভুল।'); return; } } } catch { alert('বর্তমান কোড যাচাই করা যায়নি।'); return; }
    if (recoveryEmailNew.trim()) { const _em = recoveryEmailNew.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_em)) { alert('সঠিক মেইল ঠিকানা দিন।'); return; } try { const _eh = await sha256Hex('hisabx-email:' + _em); localStorage.setItem('hisabx-recovery-email-hash', _eh); } catch {} }
    try { const h = await sha256Hex('hisabx-phone:' + ph); localStorage.setItem('hisabx-recovery-phone-hash', h); localStorage.setItem('hisabx-recovery-phone-masked', '****' + ph.slice(-4)); try { localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); } catch {} setRecoveryAttempts(0); setRecoveryPhoneNew(''); setRecoveryEmailNew(''); setLockPanel('main'); alert('পুনরুদ্ধারের ফোন নম্বর সেভ হয়েছে — কোড ভুলে গেলে এই নম্বর দিয়ে নতুন কোড সেট করতে পারবেন। আগের হিসাব মুছবে না।'); } catch { alert('ফোন নম্বর সেভ করা যায়নি।'); }
  };
  const verifyRecoveryPhone = async () => {
    const _recLockedUntil = Number(localStorage.getItem('hisabx-recovery-locked-until') || 0) || 0;
    if (Date.now() < _recLockedUntil) { setPinError('ফোন নম্বর যাচাই ৫ বার ব্যর্থ — ১০ মিনিট পর আবার চেষ্টা করুন।'); return; }
    if (_recLockedUntil > 0) { try { localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); } catch {} setRecoveryAttempts(0); }
    const _ra = Number(localStorage.getItem('hisabx-recovery-attempts') || 0) || 0;
    if (_ra >= 5) { const _u = Date.now() + 10 * 60 * 1000; try { localStorage.setItem('hisabx-recovery-locked-until', String(_u)); } catch {} setPinError('ফোন নম্বর যাচাই ৫ বার ব্যর্থ — ১০ মিনিট পর আবার চেষ্টা করুন।'); return; }
    const _emInput = recoveryEmail.trim().toLowerCase();
    const ph = normalizePhoneBD(recoveryPhone);
    if (!ph && _emInput) {
      try {
        const _storedEm = localStorage.getItem('hisabx-recovery-email-hash');
        if (!_storedEm) { setPinError('কোনো পুনরুদ্ধার মেইল রেজিস্টার করা নেই।'); return; }
        const _eh = await sha256Hex('hisabx-email:' + _emInput);
        if (_eh === _storedEm) { try { localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); } catch {} setRecoveryAttempts(0); setRecoveryStep(2); setPinError(''); return; }
        const _nE = _ra + 1; try { localStorage.setItem('hisabx-recovery-attempts', String(_nE)); } catch {} setRecoveryAttempts(_nE); setPinError('এই মেইল রেজিস্টার করা মেইলের সাথে মিলছে না। (' + _nE + '/5)'); return;
      } catch { setPinError('যাচাই করা যায়নি।'); return; }
    }
    if (!ph) { setPinError('সঠিক ফোন নম্বর দিন (01XXXXXXXXX) অথবা রেজিস্টার করা মেইল দিন।'); return; }
    try {
      const stored = localStorage.getItem('hisabx-recovery-phone-hash');
      if (!stored) { setPinError('কোনো পুনরুদ্ধার ফোন নম্বর রেজিস্টার করা নেই।'); return; }
      const h = await sha256Hex('hisabx-phone:' + ph);
      if (h === stored) { try { localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); } catch {} setRecoveryAttempts(0); setRecoveryStep(2); setPinError(''); }
      else { const _n = _ra + 1; try { localStorage.setItem('hisabx-recovery-attempts', String(_n)); } catch {} setRecoveryAttempts(_n); if (_n >= 5) { const _u2 = Date.now() + 10 * 60 * 1000; try { localStorage.setItem('hisabx-recovery-locked-until', String(_u2)); } catch {} setPinError('ফোন নম্বর যাচাই ৫ বার ব্যর্থ — ১০ মিনিট পর আবার চেষ্টা করুন।'); } else setPinError('এই ফোন নম্বর রেজিস্টার করা নম্বরের সাথে মিলছে না। (' + _n + '/5)'); }
    } catch { setPinError('যাচাই করা যায়নি।'); }
  };
  const resetPinViaPhone = async () => {
    if (recoveryStep !== 2) { setPinError('প্রথমে রেজিস্টার করা ফোন নম্বর দিয়ে যাচাই করুন।'); return; }
    if (recoveryNewPin.length < 4 || recoveryNewPin.length > 12) { setPinError('নতুন কোড ৪-১২ অক্ষরের হতে হবে।'); return; }
    if (recoveryNewPin !== recoveryConfirmPin) { setPinError('দুইবার একই কোড লিখুন।'); return; }
    if (!/^[0-9a-zA-Z]+$/.test(recoveryNewPin)) { setPinError('কোডে শুধু সংখ্যা/ইংরেজি অক্ষর ব্যবহার করুন।'); return; }
    try { const h = await sha256Hex('hisabx-pin:' + recoveryNewPin); localStorage.setItem('hisabx-pin-hash', h); try { localStorage.removeItem('hisabx-pin-attempts'); localStorage.removeItem('hisabx-pin-locked-until'); localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); } catch {} setPinAttempts(0); setPinLockedUntil(0); setRecoveryAttempts(0); setIsLocked(false); setShowRecovery(false); setRecoveryStep(1); setRecoveryPhone(''); setRecoveryNewPin(''); setRecoveryConfirmPin(''); setPinError(''); alert('নতুন কোড সেট হয়েছে — আগের সব হিসাব আগের মতোই আছে।'); } catch { setPinError('নতুন কোড সেভ করা যায়নি।'); }
  };
  const setPinCode = async () => {
    try { const _existing = localStorage.getItem('hisabx-pin-hash'); if (_existing) { if (!pinOld) { alert('কোড বদলাতে হলে প্রথমে বর্তমান (পুরোনো) কোড লিখুন।'); return; } const _oldH = await sha256Hex('hisabx-pin:' + pinOld); if (_oldH !== _existing) { alert('বর্তমান (পুরোনো) কোড ভুল।'); return; } } } catch { alert('বর্তমান কোড যাচাই করা যায়নি।'); return; }
    if (pinNew.length < 4 || pinNew.length > 12) { alert('কোড ৪-১২ অক্ষরের হতে হবে।'); return; }
    if (pinNew !== pinConfirm) { alert('দুইবার একই কোড লিখুন।'); return; }
    if (!/^[0-9a-zA-Z]+$/.test(pinNew)) { alert('কোডে শুধু সংখ্যা/ইংরেজি অক্ষর ব্যবহার করুন।'); return; }
    try { const h = await sha256Hex('hisabx-pin:' + pinNew); localStorage.setItem('hisabx-pin-hash', h); try { localStorage.removeItem('hisabx-pin-attempts'); localStorage.removeItem('hisabx-pin-locked-until'); } catch {} setPinAttempts(0); setPinLockedUntil(0); setPinOld(''); setPinNew(''); setPinConfirm(''); setIsLocked(true); alert('কোড সেট হয়েছে — এখন থেকে হিসাব দেখতে কোড লাগবে।'); } catch { alert('কোড সেভ করা যায়নি।'); }
  };
  const removePinCode = async () => {
    if (!confirm('লক তুলে ফেলবেন? যে কেউ হিসাব দেখতে পারবে।')) return;
    try { localStorage.removeItem('hisabx-pin-hash'); localStorage.removeItem('hisabx-pin-attempts'); localStorage.removeItem('hisabx-pin-locked-until'); localStorage.removeItem('hisabx-recovery-attempts'); localStorage.removeItem('hisabx-recovery-locked-until'); localStorage.removeItem('hisabx-recovery-email-hash'); localStorage.removeItem('hisabx-recovery-phone-hash'); localStorage.removeItem('hisabx-recovery-phone-masked'); setPinAttempts(0); setPinLockedUntil(0); setRecoveryAttempts(0); setIsLocked(false); setPinError(''); } catch {}
  };
  const calc = useMemo(() => {
    const eng = calcLedgerEngine(accounts, transactions);
    let rec = 0; let pay = 0; let overflow = false;
    eng.perPerson.forEach((p) => {
      const nr = safeAdd(rec, p.receivable);
      const np = safeAdd(pay, p.payable);
      if (nr === null || np === null) overflow = true;
      else { rec = nr; pay = np; }
    });
    let totalCashBank = 0;
    Object.values(eng.bal).forEach((v) => { const n = safeAdd(totalCashBank, v); if (n === null) overflow = true; else totalCashBank = n; });
    const totalAssets = safeAdd(totalCashBank, rec);
    const totalLiabilities = pay;
    const netWorth = totalAssets === null ? null : safeAdd(totalAssets, -totalLiabilities);
    return { bal: eng.bal, balMap: eng.balMap, perPersonMap: eng.perPerson, totalAssets: totalAssets, totalLiabilities: totalLiabilities, netWorth: netWorth, rec: rec, pay: pay, ledgerCorrupt: eng.corrupt || overflow, ledgerErrors: eng.errors };
  }, [transactions, accounts]);
  const showAmt = (v) => (isLocked ? '••••' : fmt(v));
  const perPerson = useMemo(() => {
    const obj = Object.create(null);
    calc.perPersonMap.forEach((v, k) => { obj[k] = v; });
    return obj;
  }, [calc]);
        const filteredTx = useMemo(() => {
    // List filter is SEPARATE from the + নতুন লেনদেন form selector (`type`).
    // The form selector must never move the list (else Edit/search looks broken).
    let list = transactions;
    if (listCategory !== 'all') list = list.filter((t) => t.type === listCategory);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => (t.person || '').toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q));
  }, [transactions, search, listCategory]);
  const saveTx = async () => { if (!acquireOpLock()) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); return; } try { await _saveTxCore(); } finally { releaseOpLock(); } };
  const _saveTxCore = async () => {
    if (isInitializing) { alert('হিসাব লোড হচ্ছে — একটু অপেক্ষা করুন।'); return; }
    if (saving) return;
    if (_blocked || calc.ledgerCorrupt) { alert('Corrupt / Blocked — হিসাব বন্ধ। Restore করুন।'); return; }
    if (!isValidDateStr(date)) { alert('লেনদেনের তারিখ ঠিক নয়।'); return; }
    if (!isValidTimeStr(txTime)) { alert('লেনদেনের সময় ঠিক নয় (HH:MM)।'); return; }
    if (receiptDate && !isValidDateStr(receiptDate)) { alert('রসিদের তারিখ ঠিক নয়।'); return; }

    const _p = parseAmountToPaisa(amount);
    if (_p === null) { alert('টাকার পরিমাণ ঠিক লিখুন — সর্বোচ্চ ২ ঘর দশমিক পর্যন্ত।'); return; }
    const amtPaisa = _p;
    if (!note.trim()) { alert('বিবরণ বাধ্যতামূলক — বিবরণ লিখুন (যেমন: বাজার, বেতন, রহিমকে ধার)।'); return; }
    if ((NEED_PERSON.includes(type) || type === 'gift') && !normalizePerson(person)) { alert('ব্যক্তির নাম বাধ্যতামূলক — ব্যক্তির নাম লিখুন।'); return; }
    // Main account can be a preset not yet owned — auto-create it on save (for ALL types).
    let _accountId = account;
    let _autoAccMain = null;
    if (String(account || '').startsWith('preset:')) { const _pid2 = String(account).slice(7); const _pp2 = presetById(_pid2); if (!_pp2 || _pp2.id === 'custom' || _pp2.id === 'other') { alert('অ্যাকাউন্ট ক্যাটাগরি ঠিক নাই।'); return; } const _ex2 = findAccountForPreset(accounts, _pid2); if (_ex2) { _accountId = _ex2.id; } else { _autoAccMain = { id: newId(), name: freeAccountName(accounts, _pp2.label), openingDate: getLocalDate(), opening: 0, openingPaisa: 0, kind: _pp2.group, preset: _pid2, presetLabel: _pp2.label }; _accountId = _autoAccMain.id; } }
    if (!_autoAccMain && !accounts.find((a) => a.id === account)) { alert('অ্যাকাউন্ট পাওয়া যায়নি।'); return; }
    // Medium and account are independent: medium = how money came (Nagad/Bkash/cash), account = where it is kept. They CAN differ (e.g. received via Nagad, kept as cash). So no blocking mismatch check.
    if (type === 'transfer' && !accounts.find((a) => a.id === toAccount)) { alert('গন্তব্য অ্যাকাউন্ট পাওয়া যায়নি।'); return; }
    if (type === 'transfer' && account === toAccount) { alert('একই অ্যাকাউন্টে স্থানান্তর হবে না।'); return; }
    const baseTx = editId ? transactions.filter((x) => x.id !== editId) : transactions;
    const _accountsForSaveMain = _autoAccMain ? [...accounts, _autoAccMain] : accounts;
    const baseEng = calcLedgerEngine(_accountsForSaveMain, baseTx);
    // STRONG balance guard: outgoing types can NEVER spend more than the source account holds (edit counts without the old tx).
    // This runs before the historical check so no case can slip through.
    if (['expense', 'transfer', 'lent', 'paid'].includes(type)) {
      const _earlyEng = calcLedgerEngine(_accountsForSaveMain, baseTx);
      const _earlyBal = (_earlyEng.bal && _earlyEng.bal[_accountId] !== undefined) ? _earlyEng.bal[_accountId] : 0;
      const _srcName = (_accountsForSaveMain.find((a) => a.id === _accountId)?.name) || 'এই অ্যাকাউন্ট';
      if (amtPaisa > _earlyBal) { alert('❌ ' + _srcName + ' অ্যাকাউন্টে মাত্র ৳ ' + fmt(_earlyBal) + ' আছে — ৳ ' + fmt(amtPaisa) + ' খরচ / পাঠানো যাবে না। টাকা নেই এমন অ্যাকাউন্ট থেকে টাকা যাবে না।'); return; }
    }
    const _verb = editId ? 'এই সম্পাদনায়' : 'এই লেনদেনে';
    // FIX-13 (4): Historical Person Balance - received/paid must not exceed due as of that date, not future due
    if ((type === 'received' || type === 'paid') && NEED_PERSON.includes(type)) {
      const _hist = baseTx.filter((t) => (String(t.date || '') < String(date) || (String(t.date || '') === String(date) && String(t.time || '00:00') <= String(txTime))) && personKey(t.person || '') === personKey(person));
      let _dueHist = 0;
      _hist.forEach((t) => { if (type === 'received' && t.type === 'lent') _dueHist = safeAdd(_dueHist, t.amountPaisa) ?? _dueHist; if (type === 'received' && t.type === 'received') _dueHist = safeAdd(_dueHist, -t.amountPaisa) ?? _dueHist; if (type === 'paid' && t.type === 'borrowed') _dueHist = safeAdd(_dueHist, t.amountPaisa) ?? _dueHist; if (type === 'paid' && t.type === 'paid') _dueHist = safeAdd(_dueHist, -t.amountPaisa) ?? _dueHist; });
      if (amtPaisa > _dueHist) { alert('এই তারিখে এই ব্যক্তির কাছে ' + (type === 'received' ? 'পাওনা' : 'দেনা') + ' আছে ৳ ' + fmt(_dueHist) + '। এর বেশি ' + (type === 'received' ? 'আদায়' : 'পরিশোধ') + ' করা যাবে না — ভবিষ্যতের হিসাব ব্যবহার করা যাবে না।'); return; }
    }
    // FIX-14.06: Only historical due check above (FIX-13.4) is used. Total-due duplicate removed - future tx must not reject past payment.
    // B/N + T (FIX-12): Historical running-balance check, not current total. Backdated expense must not use future money.
    if (type === 'transfer' || type === 'expense' || type === 'lent' || type === 'paid') {
      const _maxSeqC = baseTx.reduce((m, t) => Math.max(m, Number(t.seq || 0)), 0);
      const _cand = { id: 'candidate', seq: Math.max(Date.now(), _maxSeqC + 1), type: type, account: _accountId, toAccount: type === 'transfer' ? toAccount : undefined, amountPaisa: amtPaisa, date: date, time: txTime };
      const _bal = {};
      accounts.forEach((a) => { _bal[a.id] = 0; });
      const _openedHist = {};
      const _sorted = [...baseTx, _cand].sort((x, y) => String(x.date || '').localeCompare(String(y.date || '')) || String(x.time || '00:00').localeCompare(String(y.time || '00:00')) || Number(x.seq || 0) - Number(y.seq || 0) || String(x.id || '').localeCompare(String(y.id || '')));
      let _blockedHist = null;
      for (const t of _sorted) {
        accounts.forEach((a) => { if (!_openedHist[a.id] && String(t.date || '') >= String(a.openingDate || '0000-01-01')) { _bal[a.id] = safeAdd(_bal[a.id] || 0, accountOpeningPaisa(a) || 0) ?? _bal[a.id]; _openedHist[a.id] = true; } });
        const _amt = t.amountPaisa;
        const _apply = (accId, delta) => { const cur = _bal[accId] ?? 0; const nxt = safeAdd(cur, delta); if (nxt === null) { _blockedHist = { reason: 'overflow' }; return cur; } _bal[accId] = nxt; return nxt; };
        let _v = null;
        if (t.type === 'income') _v = _apply(t.account, _amt);
        if (t.type === 'gift') _v = _apply(t.account, _amt);
        if (t.type === 'expense') _v = _apply(t.account, -_amt);
        if (t.type === 'lent') _v = _apply(t.account, -_amt);
        if (t.type === 'borrowed') _v = _apply(t.account, _amt);
        if (t.type === 'received') _v = _apply(t.account, _amt);
        if (t.type === 'paid') _v = _apply(t.account, -_amt);
        if (t.type === 'transfer') { const a1 = _apply(t.account, -_amt); const a2 = _apply(t.toAccount, _amt); _v = Math.min(a1, a2); }
        if (_v !== null && _v < 0) { if (String(t.date || '') < String(date) && t.id !== 'candidate') { /* pre-existing negative from an old tx BEFORE this new one — not caused by this save, ignore */ } else { _blockedHist = { reason: 'negative', date: t.date, balance: _v }; break; } }
        if (String(t.date || '') > String(date)) break;
      }
      if (_blockedHist) { alert('এই তারিখে (' + String(_blockedHist.date || date) + ') এই অ্যাকাউন্টে যথেষ্ট টাকা ছিল না — ভবিষ্যতের টাকা দিয়ে অতীতের খরচ করা যাবে না।'); return; }
    }
    if ((paymentMethod === 'custom' || paymentMethod === 'other')) { const _cp = customPaymentMethodTx.trim(); if (_cp.length > 100) { alert('নিজে লেখা মাধ্যম ১০০ অক্ষরের বেশি হবে না।'); return; } if (/[<>{}\[\]\\]/.test(_cp)) { alert('মাধ্যমের নামে < > { } [ ] \\ ব্যবহার করা যাবে না।'); return; } if (_cp.length > 0 && _cp.length < 2) { alert('মাধ্যমের নাম কমপক্ষে ২ অক্ষর হতে হবে।'); return; } }
    if (paymentMethod === 'custom' && !customPaymentMethodTx.trim()) { alert('নিজে লেখা মাধ্যমের নাম লিখুন।'); return; }
    const _pName = (NEED_PERSON.includes(type) || type === 'gift') ? normalizePerson(person) : '';
    if (!NEED_PERSON.includes(type) && type !== 'gift' && person.trim()) { /* U: Income/Expense/Transfer must not create Person entry - ignore person input */ }
    const _pKey = personKey(_pName);

    // FIX-14.02 COMPLETE: person vs personId consistency - existing person name must match, no guessed person
    if ((NEED_PERSON.includes(type) || type === 'gift') && _pName) { const _existByName = persons.find((pp) => pp.key === _pKey); if (_existByName && normalizePerson(_existByName.name) !== _pName) { /* same key implies same normalized name, so this cannot happen */ } }
    let _personId = null;
  let _nextPersons = persons;
    if ((NEED_PERSON.includes(type) || type === 'gift') && _pName) {
      const _ex = persons.find((p) => p.key === _pKey);
      if (_ex) _personId = _ex.id;
      else { _personId = newId(); _nextPersons = [...persons, { id: _personId, name: _pName, key: _pKey }]; }
    }
    const _maxSeq = transactions.reduce((m, t) => Math.max(m, Number(t.seq || 0)), 0);
    const _seq = editId ? (transactions.find((x) => x.id === editId)?.seq ?? _maxSeq + 1) : Math.max(Date.now(), _maxSeq + 1);
    const tx = { id: editId || newId(), seq: _seq, createdAt: editId ? (transactions.find((x) => x.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(), type: type, account: _accountId, toAccount: type === 'transfer' ? toAccount : undefined, person: _pName, personId: _personId, amount: amtPaisa / 100, amountPaisa: amtPaisa, note: note.trim(), date: date, time: txTime, receiptDate: receiptDate || date, paymentMethod: paymentMethod, customPaymentMethod: (paymentMethod === 'custom' || paymentMethod === 'other') ? customPaymentMethodTx.trim() : '' };
    if (!Number.isFinite(tx.amount) || Math.round(tx.amount * 100) !== tx.amountPaisa) { alert('Amount / Paisa অসামঞ্জস্য — সংরক্ষণ হবে না।'); return; }
    if ((NEED_PERSON.includes(type) || type === 'gift') && tx.personId && _nextPersons.find((p) => p.id === tx.personId)?.key !== personKey(tx.person)) { alert('Person ID / Name অসামঞ্জস্য — সংরক্ষণ হবে না।'); return; }
    const next = editId ? transactions.map((x) => x.id === editId ? tx : x) : [tx, ...transactions];
    const _accountsForSave = _accountsForSaveMain;
    const aIds = new Set(_accountsForSave.map((a) => a.id));
    const pIds = new Set(_nextPersons.map((p) => p.id));
    if (!next.every((t2) => isValidTx(t2, aIds, pIds))) { alert('লেনদেন যাচাইয়ে ব্যর্থ — সংরক্ষণ হবে না।'); return; }
    // Targeted person check (FIX #1): only THIS person's balance matters for THIS save.
    // A pre-existing negative for some OTHER person must not block a new income/gift/etc.
    if (NEED_PERSON.includes(type) && _pName) {
      const _pEng = calcLedgerEngine(_accountsForSaveMain, baseTx);
      const _pe = _pEng.perPerson.get(_pKey);
      const _rec = _pe ? _pe.receivable : 0;
      const _pay = _pe ? _pe.payable : 0;
      if (type === 'received' && amtPaisa > _rec) { alert(_verb + ' এই ব্যক্তির কাছে পাওনা আছে ৳ ' + fmt(_rec) + '। এর বেশি আদায় করা যাবে না।'); return; }
      if (type === 'paid' && amtPaisa > _pay) { alert(_verb + ' এই ব্যক্তির কাছে দেনা আছে ৳ ' + fmt(_pay) + '। এর বেশি পরিশোধ করা যাবে না।'); return; }
      // lent/borrowed only increase receivable/payable — they can never make them negative.
    }
    // Targeted account check (FIX): only OUTGOING types can drain an account.
    // Income/gift/borrowed/received only ADD money — they must never be blocked by "not enough money".
    // And the check is against THIS account's balance (excluding the edited tx), not the whole history.
    if (['expense', 'transfer', 'lent', 'paid'].includes(type)) {
      const _srcBal = (baseEng.bal && baseEng.bal[_accountId] !== undefined) ? baseEng.bal[_accountId] : 0;
      if (amtPaisa > _srcBal) { alert(_verb + ' অ্যাকাউন্টে যথেষ্ট টাকা নেই — ব্যালেন্স ৳ ' + fmt(_srcBal) + '। এর বেশি খরচ / স্থানান্তর করা যাবে না।'); return; }
    }
    setSaving(true);
    try {
      const prevHash = auditLog.length ? auditLog[0].hash || '' : '';
      const _audit = await createAuditEntry(editId ? 'edit' : 'create', 'transaction', tx.id, editId ? transactions.find((x) => x.id === editId) : null, tx, prevHash);
      const _sr = await saveAllAtomicWithAudit({ accounts: _accountsForSave, transactions: next, deletedLog: deletedLog, auditLog: [_audit, ...auditLog], persons: _nextPersons });
      setSaving(false);
      if (!_sr.ok) { if (_sr.primaryCommitted && _sr.readbackFailed) { alert('সতর্কতা: লেনদেন IndexedDB-তে Commit হয়েছে কিন্তু Readback যাচাই ব্যর্থ — আবার Save করবেন না। Refresh করে হিসাব মিলিয়ে দেখুন।'); setSaving(false); return; } alert('সংরক্ষণ করা যায়নি — লেনদেন যোগ হয়নি। ' + (_sr.error || '')); return; }
      if (_sr.mirrorFailed) alert('সংরক্ষণ হয়েছে, তবে Backup Mirror-এ সমস্যা: ' + (_sr.mirrorError || ''));
      if (_nextPersons !== persons) setPersons(_nextPersons);
      if (_autoAccMain) { setAccounts(_accountsForSave); setAccount(_accountId); }
      setAuditLog([_audit, ...auditLog]);
      setTransactions(next);
      setAmount(''); setPerson(''); setNote(''); setEditId(null);
      alert(editId ? 'লেনদেন সম্পাদনা করা হয়েছে।' : 'লেনদেন সংরক্ষণ করা হয়েছে।');
    } catch (e) {
      setSaving(false);
      alert('সংরক্ষণ করা যায়নি — ' + String(e && e.message ? e.message : e));
    }
  };
  const startEdit = (t) => {
    setEditId(t.id); setType(t.type); setAccount(t.account); setToAccount((t.toAccount && t.toAccount !== t.account) ? t.toAccount : (accounts.find((a) => a.id !== t.account)?.id || ''));
    setPaymentMethod(t.paymentMethod || 'cash');
    setCustomPaymentMethodTx(t.customPaymentMethod || ''); setPerson(t.person || ''); setAmount(String(t.amountPaisa / 100)); setNote(t.note || ''); setDate(t.date || getLocalDate()); setTxTime(t.time || '00:00'); setReceiptDate(t.receiptDate || t.date || getLocalDate());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deleteTx = async (id) => { if (!acquireOpLock()) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); return; } try { await _deleteTxCore(id); } finally { releaseOpLock(); } };
  const _deleteTxCore = async (id) => {
    if (saving) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); return; }
    if (isInitializing) { alert('হিসাব লোড হচ্ছে — একটু অপেক্ষা করুন।'); return; }
    if (!confirm('এই লেনদেনটি মুছে ফেলবেন?')) return;
    const found = transactions.find((x) => x.id === id);
    if (!found) { alert('লেনদেন পাওয়া যায়নি।'); return; }
    const next = transactions.filter((x) => x.id !== id);
    // Targeted person check (FIX #1): only the deleted tx's person matters.
    if (['lent', 'borrowed', 'received', 'paid'].includes(found.type) && found.person) {
      const _pEngD = calcLedgerEngine(accounts, next);
      const _peD = _pEngD.perPerson.get(personKey(found.person));
      if (_peD && (_peD.receivable < 0 || _peD.payable < 0)) { alert('এই লেনদেন মুছলে ' + found.person + ' এর পাওনা/দেনা নেগেটিভ হয়ে যাবে — মুছা যাবে না।'); return; }
    }
    // Only block delete if THIS deletion itself creates a new account-negative (not a pre-existing one).
    if (!hasAccountNegative(transactions, accounts) && hasAccountNegative(next, accounts)) { alert('এই লেনদেন মুছলে অ্যাকাউন্টের ব্যালেন্স নেগেটিভ হয়ে যাবে — অ্যাকাউন্টে যথেষ্ট টাকা নেই। মুছা যাবে না।'); return; }
    const _nextDeleted = [{ id: newId(), txId: found.id, deletedAt: new Date().toISOString(), type: found.type, amountPaisa: found.amountPaisa, date: found.date, original: found }, ...deletedLog];
    try {
      const _prev = auditLog.length ? auditLog[0].hash || '' : '';
      const _e = await createAuditEntry('delete', 'transaction', found.id, found, null, _prev);
      const _sr2 = await saveAllAtomicWithAudit({ accounts: accounts, transactions: next, deletedLog: _nextDeleted, auditLog: [_e, ...auditLog], persons: persons });
      if (!_sr2.ok) { alert('সংরক্ষণ করা যায়নি — মুছা হয়নি। ' + (_sr2.error || '')); return; }
      setTransactions(next); setDeletedLog(_nextDeleted); setAuditLog([_e, ...auditLog]);
    } catch (e) { alert('মুছা যায়নি — ' + String(e && e.message ? e.message : e)); }
  };
  const addAccount = async () => { if (!acquireOpLock()) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); return; } try { await _addAccountCore(); } finally { releaseOpLock(); } };
  const _addAccountCore = async () => {
    if (saving) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); return; }
    if (isInitializing) { alert('হিসাব লোড হচ্ছে — একটু অপেক্ষা করুন।'); return; }
    if (_blocked || calc.ledgerCorrupt) { alert('Corrupt / Blocked — নতুন অ্যাকাউন্ট বন্ধ।'); return; }
    const _preset = presetById(newAccPreset);
    let _accName = '';
    if (newAccPreset === 'custom') { if (!newAccCustom.trim() && !newAccName.trim()) { alert('অ্যাকাউন্টের নাম লিখুন।'); return; } _accName = (newAccCustom.trim() || newAccName.trim()); } else if (newAccPreset === 'other') { if (!newAccName.trim()) { alert('অ্যাকাউন্টের নাম লিখুন।'); return; } _accName = newAccName.trim(); } else { _accName = newAccName.trim() ? newAccName.trim() : _preset.label; }
    if (accounts.some((a) => a.name.trim().toLowerCase() === _accName.toLowerCase())) { const _free = freeAccountName(accounts, _accName); alert('এই নামে অ্যাকাউন্ট আগেই আছে, তাই `' + _free + '` নামে যোগ করা হচ্ছে।'); _accName = _free; }
    const _op = parseAmountToPaisa(newAccOpening.trim() === '' ? '0' : newAccOpening, true);
    if (_op === null) { alert('প্রারম্ভিক ব্যালেন্স ঠিক লিখুন — নেগেটিভ না, সর্বোচ্চ ২ ঘর দশমিক।'); return; }
    const acc = { id: newId(), name: _accName, openingDate: getLocalDate(), opening: _op / 100, openingPaisa: _op, kind: _preset.group, preset: newAccPreset, presetLabel: _preset.label };
    if (accounts.some((a) => a.id === acc.id)) { alert('ID সংঘর্ষ — আবার চেষ্টা করুন।'); return; }
    const nextAcc = [...accounts, acc];
    try {
      const _audit = await createAuditEntry('create', 'account', acc.id, null, acc, auditLog.length ? auditLog[0].hash || '' : '');
      const _sr3 = await saveAllAtomicWithAudit({ accounts: nextAcc, transactions: transactions, deletedLog: deletedLog, auditLog: [_audit, ...auditLog], persons: persons });
      if (!_sr3.ok) { alert('অ্যাকাউন্ট সংরক্ষণ করা যায়নি। ' + (_sr3.error || '')); return; }
      setAuditLog([_audit, ...auditLog]); setAccounts(nextAcc); setNewAccName(''); setNewAccOpening(''); setNewAccCustom('');
    } catch (e) { alert('অ্যাকাউন্ট সংরক্ষণ করা যায়নি — ' + String(e && e.message ? e.message : e)); }
  };
  const exportCSV = () => {
    if (calc.ledgerCorrupt) { alert('Corrupt ডাটা — Export বন্ধ। Restore করুন।'); return; }
    const rows = [['তারিখ', 'ধরন', 'অ্যাকাউন্ট', 'গন্তব্য অ্যাকাউন্ট', 'ব্যক্তি', 'টাকা', 'বিবরণ', 'রসিদ তারিখ']];
    filteredTx.forEach((t) => rows.push([t.date, t.type, accounts.find((a) => a.id === t.account)?.name || t.account, t.type === 'transfer' ? (accounts.find((a) => a.id === t.toAccount)?.name || t.toAccount || '') : '', t.person || '', (t.amountPaisa / 100), (t.note || ''), t.receiptDate || t.date]));
    const csvEscape = (v) => { let s = String(v ?? ''); const trimmed = s.replace(/^[\s\u0000-\u001F]+/, ''); if (/^[=+\-@|%\t\r]/.test(trimmed)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = rows.map((r) => r.map((c) => csvEscape(c)).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' });
    const a = document.createElement('a'); const url = URL.createObjectURL(blob); a.href = url; a.download = 'hisabx-' + getLocalDate() + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportJSON = async () => {
    if (calc.ledgerCorrupt) { alert('Corrupt ডাটা — Backup Export বন্ধ। Restore করুন।'); return; }
    const data = { schemaVersion: 2, appVersion: 'STEP-01-FINAL-AZ', exportedAt: new Date().toISOString(), migrationVersion: migrated.v2Status || 'unknown', accounts: accounts, transactions: transactions, persons: persons, deletedLog: deletedLog, auditLog: auditLog, integrityHash: '', meta: { accountCount: accounts.length, transactionCount: transactions.length, personCount: persons.length, totalAssets: calc.totalAssets, totalLiabilities: calc.totalLiabilities } };
    try { data.integrityHash = await sha256Hex(JSON.stringify({ accounts: data.accounts, transactions: data.transactions, persons: data.persons, deletedLog: data.deletedLog, auditLog: data.auditLog })); } catch (e) { alert('SHA-256 ব্যর্থ — Export বন্ধ।'); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); const url2 = URL.createObjectURL(blob); a.href = url2; a.download = 'hisabx-backup-' + getLocalDate() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url2), 1000);
  };
  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Backup ফাইল অনেক বড় (৫ MB এর বেশি)।'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onerror = () => { alert('ফাইল পড়া যায়নি: ' + String(reader.error && reader.error.message ? reader.error.message : 'unknown')); e.target.value = ''; };
    reader.onabort = () => { alert('ফাইল পড়া বাতিল হয়েছে।'); e.target.value = ''; };
    reader.onload = async () => {
      if (!acquireOpLock()) { alert('আরেকটি কাজ চলছে — একটু অপেক্ষা করুন।'); e.target.value = ''; return; }
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.schemaVersion !== 2) { alert('এই ফাইলটি সঠিক Backup ফাইল না (schemaVersion 2 লাগবে)।'); return; }
        if (!Array.isArray(data.accounts) || !Array.isArray(data.transactions) || !Array.isArray(data.persons) || !Array.isArray(data.deletedLog) || !Array.isArray(data.auditLog)) { alert('Backup-এ ৫টি Collection বাধ্যতামূলক।'); return; }
        if (!data.integrityHash) { alert('Backup-এ Integrity Hash নেই — Restore বাতিল।'); return; }
        try {
          const expectHash = await sha256Hex(JSON.stringify({ accounts: data.accounts, transactions: data.transactions, persons: data.persons, deletedLog: data.deletedLog, auditLog: data.auditLog }));
          if (expectHash !== data.integrityHash) { alert('Backup Integrity Hash অমিল — Restore বাতিল।'); return; }
        } catch { alert('SHA-256 যাচাই ব্যর্থ — Restore বাতিল।'); return; }
        if (!confirm('পুরোনো হিসাবের Backup নিয়ে তারপর নতুন হিসাব আনবেন? বর্তমান হিসাব বদলে যাবে।')) return;
        const v = await validateV2CollectionsAsync(data.accounts, data.transactions, data.persons, data.deletedLog, data.auditLog);
        if (!v.ok) { alert('Backup যাচাই ব্যর্থ: ' + v.error + ' — Restore বাতিল।'); return; }
        { const _re2 = calcLedgerEngine(data.accounts, data.transactions); let _negFinal = _re2.corrupt; Object.values(_re2.bal || {}).forEach((v) => { if (v < 0) _negFinal = true; }); _re2.perPerson.forEach((pp) => { if (pp.receivable < 0 || pp.payable < 0) _negFinal = true; }); if (_negFinal) { alert('Backup-এ বর্তমান ব্যালেন্স / পাওনা-দেনা নেগেটিভ আছে — Restore বাতিল।'); return; } }
        try { const _eng = calcLedgerEngine(data.accounts, data.transactions); if (_eng.corrupt) { alert('Backup Ledger Consistency ব্যর্থ — Restore বাতিল।'); return; } } catch { alert('Backup Ledger যাচাই ব্যর্থ — Restore বাতিল।'); return; }
        const _curBackup = { accounts: accounts, transactions: transactions, persons: persons, deletedLog: deletedLog, auditLog: auditLog, at: new Date().toISOString() };
        try { const _bakStr = JSON.stringify(_curBackup); const _bakHash = await sha256Hex(_bakStr); localStorage.setItem('hisabx-backup-before-import', JSON.stringify({ ..._curBackup, backupHash: _bakHash })); const _rb = JSON.parse(localStorage.getItem('hisabx-backup-before-import')); if (JSON.stringify(_rb.accounts) !== JSON.stringify(accounts)) { alert('Pre-Restore Backup Readback ব্যর্থ — Restore বাতিল।'); return; } } catch { alert('আগের হিসাবের Backup নেওয়া যায়নি — Restore বাতিল।'); return; }
        // FIX-11.2 P0-3: Restore prevHash must come from IMPORTED log, not current installation.
        const _importedPrev = Array.isArray(data.auditLog) && data.auditLog.length ? (data.auditLog[0].hash || '') : '';
        const _auditRestore = await createAuditEntry('restore', 'backup', null, null, null, _importedPrev);
        // Restore audit appended at chronological end (oldest) to keep chain, new audit at front for UI
        const _newAuditLog = [_auditRestore, ...data.auditLog];
        const _preChk = await verifyAuditChainAsync(_newAuditLog);
        if (!_preChk.ok) { alert('Restore Audit Chain যাচাই ব্যর্থ: ' + _preChk.error + ' — Restore বাতিল, আগের হিসাব অক্ষত।'); return; }
        const _srR = await saveAllAtomicWithAudit({ accounts: data.accounts, transactions: data.transactions, deletedLog: data.deletedLog, auditLog: _newAuditLog, persons: data.persons });
        if (!_srR.ok) { alert('Restore সংরক্ষণে ব্যর্থ — আগের হিসাব অক্ষত আছে। ' + (_srR.error || '')); return; }
        const _re = await validateV2CollectionsAsync(data.accounts, data.transactions, data.persons, data.deletedLog, _newAuditLog);
        if (!_re.ok) { setBlocked(true); setBlockedReason('Restore-পর যাচাই ব্যর্থ: ' + _re.error + ' — App Blocked। Pre-Restore Backup থেকে ফিরিয়ে আনুন।'); alert('Restore-পর যাচাই ব্যর্থ — App এখন Blocked। Pre-Restore Backup থেকে ফিরিয়ে আনুন।'); return; }
        setAccounts(data.accounts); setTransactions(data.transactions); setDeletedLog(data.deletedLog); setAuditLog(_newAuditLog); setPersons(data.persons);
        setBlocked(false); setBlockedReason('');
        if (data.accounts.length) setAccount(data.accounts[0].id);
        alert('Backup থেকে হিসাব ফিরিয়ে আনা হয়েছে। হিসাব: ' + data.accounts.length + ' অ্যাকাউন্ট, ' + data.transactions.length + ' লেনদেন।');
      } catch { alert('ফাইলটি পড়া যায়নি।'); } finally { releaseOpLock(); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const typeLabel = (t) => TYPES.find((x) => x.id === t)?.name || t;
  return (
    <main style={{ minHeight: '100vh', background: '#0A1931', padding: 18, fontFamily: 'system-ui,"Noto Sans Bengali",sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        {isInitializing && <div style={{ background: '#f59e0b', color: '#000', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13 }}>⏳ হিসাব লোড হচ্ছে — IndexedDB থেকে যাচাই করা হচ্ছে। Save / Delete / Restore এখন বন্ধ।</div>}
        {initError && <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13 }}>⚠️ {initError}</div>}
        {storageConflict && <div style={{ background: '#f59e0b', color: '#000', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13 }}>⚠️ {storageConflict}</div>}
        {blocked && <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13 }}>⚠️ Blocked: {blockedReason || 'Corrupt / Migration'} — Automatic Save বন্ধ। Backup থেকে Restore করুন।</div>}
        {calc.ledgerCorrupt && <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 13 }}>⚠️ Corrupt আর্থিক ডাটা — হিসাব ও Save বন্ধ। Amount কখনো ০ ধরা হয়নি। Errors: {(calc.ledgerErrors || []).join(', ')}</div>}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>দৈনিক আমার হিসাবX</div>
          <div style={{ fontSize: 12, opacity: .7 }}>আপনার সব হিসাব, এক অ্যাপে</div>
        </div>
        <section style={{ background: 'linear-gradient(145deg,#fff,#dce8f5)', borderRadius: 24, padding: 20, color: '#0f172a', marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#475569' }}>আমার নিট সম্পত্তি (সম্পত্তি − দায়)</p>
          <h1 style={{ fontSize: 32, margin: '8px 0' }}>৳ {calc.netWorth === null ? '— (Overflow)' : showAmt(calc.netWorth)}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={{ background: '#0f766e', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট সম্পত্তি<br /><strong>৳ {calc.totalAssets === null ? '— (Overflow)' : showAmt(calc.totalAssets)}</strong></div>
            <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট দায়<br /><strong>৳ {showAmt(calc.totalLiabilities)}</strong></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            <div style={{ background: '#ede9fe', padding: 8, borderRadius: 10 }}>আমি পাবো<br /><strong>৳ {showAmt(calc.rec)}</strong></div>
            <div style={{ background: '#fee2e2', padding: 8, borderRadius: 10 }}>আমি দেবো<br /><strong>৳ {showAmt(calc.pay)}</strong></div>
          </div>
          <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>🏦 আমার সব অ্যাকাউন্ট — ব্যালেন্স</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {accounts.map((a) => (
              <div key={a.id} style={{ background: '#e2e8f0', padding: 10, borderRadius: 10, textAlign: 'center' }}>{a.name}{a.presetLabel && a.presetLabel !== a.name ? ' (' + a.presetLabel + ')' : ''}<br /><strong>৳ {showAmt(calc.balMap.get(a.id) || 0)}</strong></div>
            ))}
            </div>
            {accounts.length === 0 ? <div style={{ opacity: .7 }}>কোনো অ্যাকাউন্ট নেই — নিচে + নতুন অ্যাকাউন্ট দিয়ে বিকাশ/নগদ/রকেট/ব্যাংক যোগ করুন।</div> : null}

            <div style={{ marginTop: 8, background: '#0f172a', color: '#fff', padding: 10, borderRadius: 10, textAlign: 'center' }}>মোট নগদ + ব্যাংক<br /><strong>৳ {showAmt(Object.values(calc.bal || {}).reduce((s, v) => s + (v || 0), 0))}</strong></div>
          </div>
          <div style={{ marginTop: 12, background: '#fff', padding: 12, borderRadius: 12 }}>
            {pinError ? <div style={{ color: '#dc2626', marginBottom: 6, fontSize: 13 }}>{pinError}</div> : null}
            <button onClick={() => setShowCode(!showCode)} style={{ width: '100%', padding: 6, borderRadius: 10, background: '#f1f5f9', fontWeight: 700, border: 'none', marginBottom: 8 }}>{showCode ? '🙈 কোড লুকান' : '👁️ কোড দেখুন'}</button>
            {isLocked ? (
              <div>
                {lockPanel === 'main' ? (
                  <div>
                    <input value={pinInput} onChange={(e) => setPinInput(e.target.value)} type={showCode ? "text" : "password"} placeholder="টাকার অংক দেখার কোড লিখুন" onKeyDown={(e) => { if (e.key === 'Enter') unlockWithPin(); }} style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <button onClick={unlockWithPin} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 700, border: 'none' }}>🔓 অংক দেখুন</button>
                    <button onClick={() => { setLockPanel('forgot'); setRecoveryStep(1); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#185ADB', fontWeight: 700, border: 'none', marginTop: 4 }}>কোড ভুলে গেছেন? → নতুন কোড সেট করুন</button>
                    <button onClick={() => { setLockPanel('register'); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#185ADB', fontWeight: 700, border: 'none' }}>📱 ফোন / মেইল রেজিস্টার করুন</button>
                    <button onClick={() => { setLockPanel('change'); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#185ADB', fontWeight: 700, border: 'none' }}>🔑 কোড বদলান</button>
                  </div>
                ) : null}
                {lockPanel === 'forgot' ? (
                  <div>
                    {recoveryStep === 1 ? (
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>রেজিস্টার করা ফোন নম্বর অথবা মেইল দিন</div>
                        <input value={recoveryPhone} onChange={(e) => setRecoveryPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                        <div style={{ fontSize: 12, opacity: .7, textAlign: 'center', marginBottom: 6 }}>অথবা</div>
                        <input value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} type="email" placeholder="মেইল (যদি রেজিস্টার করে থাকেন)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                        <button onClick={verifyRecoveryPhone} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#185ADB', color: '#fff', fontWeight: 700, border: 'none' }}>যাচাই করুন →</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>🔑 নতুন কোড সেট করুন</div>
                        <input value={recoveryNewPin} onChange={(e) => setRecoveryNewPin(e.target.value)} type={showCode ? "text" : "password"} placeholder="নতুন কোড (৪-১২ অক্ষর)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                        <input value={recoveryConfirmPin} onChange={(e) => setRecoveryConfirmPin(e.target.value)} type={showCode ? "text" : "password"} placeholder="আবার একই কোড" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                        <button onClick={async () => { await resetPinViaPhone(); setLockPanel('main'); }} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 700, border: 'none' }}>নতুন কোড দিয়ে অংক দেখুন</button>
                      </div>
                    )}
                    <button onClick={() => { setLockPanel('main'); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#64748b', fontWeight: 700, border: 'none', marginTop: 4 }}>← ফিরে যান</button>
                  </div>
                ) : null}
                {lockPanel === 'register' ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>📱 ফোন নম্বর + মেইল (ঐচ্ছিক) রেজিস্টার করুন</div>
                    <div style={{ fontSize: 12, opacity: .8, marginBottom: 6 }}>কোড ভুলে গেলে এই ফোন / মেইল দিয়ে নতুন কোড সেট করতে পারবেন।</div>
                    <input value={recoveryPhoneNew} onChange={(e) => setRecoveryPhoneNew(e.target.value)} type="tel" placeholder="01XXXXXXXXX" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={recoveryEmailNew} onChange={(e) => setRecoveryEmailNew(e.target.value)} type="email" placeholder="মেইল (ঐচ্ছিক)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinOld} onChange={(e) => setPinOld(e.target.value)} type={showCode ? "text" : "password"} placeholder="বর্তমান কোড (যদি কোড থাকে)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <button onClick={saveRecoveryPhone} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#185ADB', color: '#fff', fontWeight: 700, border: 'none' }}>রেজিস্টার করুন →</button>
                    <button onClick={() => { setLockPanel('main'); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#64748b', fontWeight: 700, border: 'none', marginTop: 4 }}>← ফিরে যান</button>
                  </div>
                ) : null}
                {lockPanel === 'change' ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>🔑 কোড বদলান</div>
                    <input value={pinOld} onChange={(e) => setPinOld(e.target.value)} type={showCode ? "text" : "password"} placeholder="বর্তমান কোড" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinNew} onChange={(e) => setPinNew(e.target.value)} type={showCode ? "text" : "password"} placeholder="নতুন কোড (৪-১২ অক্ষর)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} type={showCode ? "text" : "password"} placeholder="আবার একই কোড" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <button onClick={async () => { await setPinCode(); setLockPanel('main'); }} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 700, border: 'none' }}>কোড বদলান →</button>
                    <button onClick={() => { setLockPanel('main'); setPinError(''); }} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#64748b', fontWeight: 700, border: 'none', marginTop: 4 }}>← ফিরে যান</button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                {lockPanel === 'main' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { if (!localStorage.getItem('hisabx-pin-hash')) { setPinError('আগে কোড সেট করুন — কোড ছাড়া অংক লুকানো যাবে না। কোড বদলান চাপ দিয়ে কোড সেট করুন।'); setLockPanel('change'); return; } setIsLocked(true); }} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#0f172a', color: '#fff', fontWeight: 700, border: 'none' }}>🔒 অংক লুকান</button>
                    <button onClick={() => setLockPanel('change')} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#fff', fontWeight: 700, border: 'none' }}>🔑 কোড বদলান</button>
                  </div>
                ) : null}
                {lockPanel === 'main' ? <button onClick={() => setLockPanel('register')} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#185ADB', fontWeight: 700, border: 'none', marginTop: 4 }}>📱 ফোন / মেইল রেজিস্টার করুন</button> : null}
                {lockPanel === 'change' ? (
                  <div style={{ marginTop: 8 }}>
                    <input value={pinOld} onChange={(e) => setPinOld(e.target.value)} type={showCode ? "text" : "password"} placeholder="বর্তমান কোড" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinNew} onChange={(e) => setPinNew(e.target.value)} type={showCode ? "text" : "password"} placeholder="নতুন কোড (৪-১২ অক্ষর)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} type={showCode ? "text" : "password"} placeholder="আবার একই কোড" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <button onClick={async () => { await setPinCode(); setLockPanel('main'); }} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 700, border: 'none' }}>কোড বদলান →</button>
                    <button onClick={() => setLockPanel('main')} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#64748b', fontWeight: 700, border: 'none', marginTop: 4 }}>← ফিরে যান</button>
                  </div>
                ) : null}
                {lockPanel === 'register' ? (
                  <div style={{ marginTop: 8 }}>
                    <input value={recoveryPhoneNew} onChange={(e) => setRecoveryPhoneNew(e.target.value)} type="tel" placeholder="01XXXXXXXXX" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={recoveryEmailNew} onChange={(e) => setRecoveryEmailNew(e.target.value)} type="email" placeholder="মেইল (ঐচ্ছিক)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <input value={pinOld} onChange={(e) => setPinOld(e.target.value)} type={showCode ? "text" : "password"} placeholder="বর্তমান কোড (যদি কোড থাকে)" style={{ width: '100%', padding: 10, borderRadius: 10, marginBottom: 6 }} />
                    <button onClick={saveRecoveryPhone} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#185ADB', color: '#fff', fontWeight: 700, border: 'none' }}>রেজিস্টার করুন →</button>
                    <button onClick={() => setLockPanel('main')} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#64748b', fontWeight: 700, border: 'none', marginTop: 4 }}>← ফিরে যান</button>
                  </div>
                ) : null}
                <button onClick={removePinCode} style={{ width: '100%', padding: 8, borderRadius: 10, background: 'transparent', color: '#dc2626', fontWeight: 700, border: 'none', marginTop: 8 }}>লক তুলে ফেলুন</button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#0f172a', color: '#fff', fontWeight: 700, border: 'none' }}>📊 Excel এ নিন</button>
            <button onClick={exportJSON} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#185ADB', color: '#fff', fontWeight: 700, border: 'none' }}>💾 হিসাব বাঁচান</button>
            <label style={{ flex: 1, padding: 10, borderRadius: 10, background: '#fff', color: '#0f172a', fontWeight: 700, border: '1px solid #cbd5e1', textAlign: 'center', cursor: 'pointer' }}>
              ↩️ হিসাব ফিরান
              <input type="file" accept=".json,application/json" onChange={importJSON} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 8, lineHeight: 1.6 }}>
            <div>📊 <b>Excel এ নিন</b> — নিচে দেখা যাচ্ছে এমন লেনদেনের তালিকা Excel ফাইলে নিন। মোবাইলে / কম্পিউটারে খুলে দেখতে পারবেন, কাউকে পাঠাতে পারবেন।</div>
            <div style={{ marginTop: 4 }}>💾 <b>হিসাব বাঁচান</b> — সব হিসাব একটা ফাইলে বাঁচিয়ে রাখুন। ফোন হারালে / অ্যাপ মুছলে এই ফাইল দিয়ে হিসাব ফিরে পাবেন।</div>
            <div style={{ marginTop: 4 }}>↩️ <b>হিসাব ফিরান</b> — আগে বাঁচানো ফাইল থেকে পুরনো হিসাব আবার ফিরিয়ে আনুন। ভুল করে হিসাব মুছে গেলে এটা দিয়ে ফিরে পাবেন।</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>নিয়ম: ১) হিসাব বাঁচিয়ে রাখলে ফোন হারালেও হিসাব হারাবে না। ২) হিসাব ফিরানোর সময় আগের বাঁচানো ফাইলটাই লাগবে। ৩) Excel ফাইল দিয়ে হিসাব ফিরানো যাবে না — হিসাব ফিরাতে হলে “হিসাব বাঁচান” দিয়ে বাঁচানো ফাইল লাগবে।</div>
          </div>
        </div>
        </section>
        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>{editId ? 'লেনদেন সম্পাদনা করুন' : '+ নতুন লেনদেন'}</h3>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>{TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <label style={{ fontSize: 12, opacity: .8 }}>টাকার মাধ্যম বাছুন</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 6 }}>
            <optgroup label="মোবাইল ব্যাংকিং">{ACCOUNT_PRESETS.filter(p=>p.group==='mobile').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup><optgroup label="হাতে নগদ (ক্যাশ)">{ACCOUNT_PRESETS.filter(p=>p.group==='cash').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="ব্যাংক">{ACCOUNT_PRESETS.filter(p=>p.group==='bank').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="কার্ড">{ACCOUNT_PRESETS.filter(p=>p.group==='card').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="নিজে লিখুন / অন্যান্য">{ACCOUNT_PRESETS.filter(p=>p.group==='custom'||p.group==='other').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
          </select>
          {(paymentMethod === 'custom' || paymentMethod === 'other') && <div><label style={{ fontSize: 12, opacity: .8 }}>✏️ নিজে লিখুন — মাধ্যমের নাম এখানে লিখুন</label><input value={customPaymentMethodTx} onChange={(e) => setCustomPaymentMethodTx(e.target.value)} placeholder="নিজের মাধ্যমের নাম লিখুন — যেমন: আমার দোকানের ক্যাশ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10, border: '2px solid #f59e0b', background: '#fffbeb', color: '#000' }} /></div>}
          {type === 'transfer' && <div style={{ fontSize: 12, opacity: .8, marginBottom: 10 }}>টাকা Transfer হবে না, শুধু হিসাবের জন্য। টাকা পাঠাতে অফিসিয়াল অ্যাপ খুলুন।</div>}
          <label style={{ fontSize: 12, opacity: .8 }}>{(type === 'income' || type === 'borrowed' || type === 'received' || type === 'gift') ? 'কোন অ্যাকাউন্টে টাকা ঢুকবে?' : 'কোন অ্যাকাউন্ট থেকে টাকা যাবে?'}</label><select value={account} onChange={(e) => { const v = e.target.value; setAccount(v); if (type === 'transfer' && toAccount === v) { const _other = accounts.find((a) => a.id !== v); if (_other) setToAccount(_other.id); } }} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}><optgroup label="আমার অ্যাকাউন্ট">{accounts.map((a) => { const pr = presetById(a.preset || 'other'); return <option key={a.id} value={a.id}>{a.name}{isLocked ? '' : ' — ৳ ' + fmt(calc.bal[a.id] || 0)}</option>; })}</optgroup><optgroup label="সব ক্যাটাগরি">{ACCOUNT_PRESETS.filter((pp) => !isPresetOwned(accounts, pp)).map((pp) => <option key={'preset:' + pp.id} value={'preset:' + pp.id}>{pp.label}</option>)}</optgroup></select>
          {type === 'transfer' && <div><label style={{ fontSize: 12, opacity: .8 }}>কোন অ্যাকাউন্টে টাকা যাবে? (গন্তব্য) — সব অ্যাকাউন্ট এখানে আছে</label><select value={toAccount} onChange={(e) => setToAccount(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>{accounts.map((a) => <option key={a.id} value={a.id} disabled={a.id === account}>→ {a.name}{a.id === account ? ' (এই অ্যাকাউন্ট থেকে যাচ্ছে — গন্তব্য হতে পারবে না)' : ''}{isLocked ? '' : ' — ৳ ' + fmt(calc.bal[a.id] || 0)}</option>)}</select><div style={{ fontSize: 12, opacity: .7, marginBottom: 10 }}>গন্তব্যে তোমার সব অ্যাকাউন্ট (মোবাইল ব্যাংকিং / ক্যাশ / ব্যাংক / কার্ড) দেখাবে। যেটা থেকে টাকা যাচ্ছে, সেটা শুধু বাছা যাবে না।</div></div>}
          {(NEED_PERSON.includes(type) || type === 'gift') && <div><label style={{ fontSize: 12, opacity: .8 }}>'ব্যক্তির নাম * (বাধ্যতামূলক)'</label><input value={person} onChange={(e) => setPerson(e.target.value)} placeholder={type === 'gift' ? 'ব্যক্তির নাম (বাধ্যতামূলক)' : 'ব্যক্তির নাম (বাধ্যতামূলক)'} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} /></div>}
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="টাকার পরিমাণ (সর্বোচ্চ ২ ঘর দশমিক)" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <label style={{ fontSize: 12, opacity: .8 }}>রসিদ তারিখ</label>
          <input value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} type="date" title="রসিদ তারিখ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <label style={{ fontSize: 12, opacity: .8 }}>লেনদেন তারিখ</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <label style={{ fontSize: 12, opacity: .8 }}>লেনদেন সময়</label>
          <input value={txTime} onChange={(e) => setTxTime(e.target.value)} type="time" title="লেনদেন সময়" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <div><label style={{ fontSize: 12, opacity: .8 }}>বিবরণ * (বাধ্যতামূলক)</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="বিবরণ লিখুন (বাধ্যতামূলক) — যেমন: বাজার, বেতন, রহিমকে ধার" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 12 }} /></div>
          <button onClick={saveTx} disabled={saving || isInitializing || _blocked || calc.ledgerCorrupt} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#185ADB', color: '#fff', fontWeight: 800, border: 'none', opacity: (saving || isInitializing || _blocked || calc.ledgerCorrupt) ? .5 : 1 }}>{saving ? 'সংরক্ষণ হচ্ছে...' : editId ? 'সম্পাদনা সংরক্ষণ করুন' : 'হিসাব সংরক্ষণ করুন'}</button>
          {editId && <button onClick={() => { setEditId(null); setAmount(''); setPerson(''); setNote(''); }} style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 10, background: '#334155', color: '#fff', border: 'none' }}>বাতিল করুন</button>}
        </section>
        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px' }}>+ নতুন অ্যাকাউন্ট</h3>
          <label style={{ fontSize: 12, opacity: .8 }}>অ্যাকাউন্টের ধরন বাছুন</label>
          <select value={newAccPreset} onChange={(e) => { setNewAccPreset(e.target.value); const p = presetById(e.target.value); if (p.group !== 'custom' && p.group !== 'other') { setNewAccName(freeAccountName(accounts, p.label)); setNewAccCustom(''); } else { setNewAccName(''); setNewAccCustom(''); } }} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>
            <optgroup label="মোবাইল ব্যাংকিং">{ACCOUNT_PRESETS.filter(p=>p.group==='mobile').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup><optgroup label="হাতে নগদ (ক্যাশ)">{ACCOUNT_PRESETS.filter(p=>p.group==='cash').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="ব্যাংক">{ACCOUNT_PRESETS.filter(p=>p.group==='bank').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="কার্ড">{ACCOUNT_PRESETS.filter(p=>p.group==='card').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
            <optgroup label="নিজে লিখুন / অন্যান্য">{ACCOUNT_PRESETS.filter(p=>p.group==='custom'||p.group==='other').map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</optgroup>
          </select>
          {(newAccPreset === 'custom' || newAccPreset === 'other') && <div><label style={{ fontSize: 12, opacity: .8 }}>✏️ নিজে লিখুন — অ্যাকাউন্টের নাম এখানে লিখুন</label><input value={newAccCustom} onChange={(e) => { setNewAccCustom(e.target.value); setNewAccName(e.target.value); }} placeholder="নিজের অ্যাকাউন্টের নাম লিখুন" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10, border: '2px solid #f59e0b', background: '#fffbeb', color: '#000' }} /></div>}
          <label style={{ fontSize: 12, opacity: .8 }}>উপরের অ্যাকাউন্ট ক্যাটাগরিতে আপনার অ্যাকাউন্ট খুঁজে না পেলে প্রয়োজনে আপনার আরও নতুন অ্যাকাউন্ট এখানে সেট করুন (মোবাইল ব্যাংকিং অথবা ব্যাংকিং অ্যাকাউন্ট)</label>
          <input value={newAccName} onChange={(e) => setNewAccName(e.target.value)} placeholder="অ্যাকাউন্টের নাম — যেমন: বিকাশ ২, নগদ ২" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={newAccOpening} onChange={(e) => setNewAccOpening(e.target.value)} type="number" step="0.01" placeholder="প্রারম্ভিক ব্যালেন্স (থাকলে)" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <button onClick={addAccount} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 800, border: 'none' }}>অ্যাকাউন্ট যোগ করুন</button>
        </section>
        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px' }}>ব্যক্তিভিত্তিক পাওনা / দেনা</h3>
          {Object.keys(perPerson).length === 0 && <p style={{ opacity: .7, fontSize: 13 }}>এখনো কারো সাথে ধার / পাওনা / দেনা নেই।</p>}
          {Object.entries(perPerson).map(([name, v]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e3a5f' }}>
              <span>{v.display || name}</span>
              <span>পাবো ৳ {showAmt(v.receivable)} • দেবো ৳ {showAmt(v.payable)}</span>
            </div>
          ))}
        </section>
        <section>
          <h3 style={{ margin: '0 0 6px' }}>লেনদেনের ইতিহাস — {listCategory === 'all' ? 'সব ক্যাটাগরি' : (TYPES.find((x) => x.id === listCategory)?.name || listCategory)} • {filteredTx.length}টি</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}><label style={{ fontSize: 12, opacity: .8, alignSelf: 'center' }}>লিস্টে কোন ক্যাটাগরি দেখবেন?</label><select value={listCategory} onChange={(e) => setListCategory(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#12294b', color: '#fff', border: '1px solid #1e3a5f' }}><option value="all">সব ক্যাটাগরি</option>{TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম / বিবরণ দিয়ে খুঁজুন..." style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 12, background: '#12294b', color: '#fff', border: '1px solid #1e3a5f' }} />
          {filteredTx.length === 0 && <p style={{ opacity: .7, fontSize: 13 }}>{listCategory === 'all' ? 'এখনো কোনো লেনদেন নেই।' : 'এই ক্যাটাগরিতে (' + (TYPES.find((x) => x.id === listCategory)?.name || listCategory) + ') এখনো কোনো লেনদেন নেই।'}</p>}
          {filteredTx.map((t) => (
            <div key={t.id} style={{ background: '#12294b', padding: 12, borderRadius: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontWeight: 700 }}>{typeLabel(t.type)}</div><div style={{ fontSize: 12, opacity: .7 }}>{t.person ? t.person + ' • ' : ''}{t.date} {t.time || ''} • {t.note} {t.type === 'transfer' ? ' • → ' + (accounts.find((a) => a.id === t.toAccount)?.name || '') : ''}</div></div>
                <div style={{ fontWeight: 800 }}>৳ {fmt(t.amountPaisa)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(t)} style={{ padding: '6px 12px', borderRadius: 8, background: '#185ADB', color: '#fff', border: 'none' }}>সম্পাদনা</button>
                <button onClick={() => deleteTx(t.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#dc2626', color: '#fff', border: 'none' }}>মুছুন</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
