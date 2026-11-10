const isValidTx=(t,ids)=>{if(!t||typeof t!=='object') return false; if(typeof t.id!=='string'||!t.id.trim()) return false; if(!['income','expense','lent','borrowed','received','paid','transfer'].includes(t.type)) return false; if(!ids.has(t.account)) return false; if(t.type==='transfer'&&!ids.has(t.toAccount)) return false; if(typeof t.amount!=='number'||!Number.isFinite(t.amount)||t.amount<=0) return false; if(!isValidDateStr(t.date)) return false; if(['lent','borrowed','received','paid'].includes(t.type)&&!normalizePerson(t.person)) return false; return true;};
const isValidAccount=(a)=>a&&typeof a.id==='string'&&a.id.trim()!==''&&typeof a.name==='string'&&a.name.trim()!==''&&Number.isFinite(Number(a.opening))&&Number(a.opening)>=0;
const isValidDateStr=(s)=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')) && !Number.isNaN(Date.parse(String(s)));
const hasNegativeLedger=(txList)=>Object.values(calcPerPersonFrom(txList)).some(p=>p.receivable<0||p.payable<0);
const calcPerPersonFrom=(txList)=>{const m={}; txList.forEach(t=>{if(!t.person) return; const k=personKey(t.person); if(!m[k]) m[k]={receivable:0,payable:0}; const a=toPaisa(t.amount); if(t.type==='lent') m[k].receivable+=a; if(t.type==='received') m[k].receivable-=a; if(t.type==='borrowed') m[k].payable+=a; if(t.type==='paid') m[k].payable-=a;}); return m;};
const personKey=(s)=>normalizePerson(s).toLowerCase();
const parseAmountToPaisa=(raw)=>{const s=String(raw??'').trim(); if(!/^\d+(\.\d{1,2})?$/.test(s)) return null; const n=Number(s); if(!Number.isFinite(n)||n<=0) return null; return Math.round(n*100);};
const normalizePerson=(s)=>String(s||'').trim().replace(/\s+/g,' ');
const getLocalDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
import { useState, useEffect, useMemo } from 'react';

const toPaisa = (taka) => { const pp = parseAmountToPaisa(taka); return pp !== null ? pp : 0; };
const toTaka = (paisa) => (paisa || 0) / 100;
const fmt = (paisa) => toTaka(paisa).toLocaleString('bn-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (data === null || typeof data !== 'object') return fallback;
    return data;
  } catch { return fallback; }
}
function safeSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { alert('সংরক্ষণ ব্যর্থ হয়েছে। ফোনের Storage খালি আছে কিনা দেখুন।'); return false; }
}
function newId() {
  try { return crypto.randomUUID(); } catch { return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000000); }
}
const TYPES = [
  { id: 'income', name: 'আয়' },
  { id: 'expense', name: 'ব্যয়' },
  { id: 'lent', name: 'আমি টাকা দিলাম' },
  { id: 'borrowed', name: 'আমি টাকা নিলাম' },
  { id: 'received', name: 'পাওনা আদায়' },
  { id: 'paid', name: 'দেনা পরিশোধ করলাম' },
  { id: 'transfer', name: 'টাকা স্থানান্তর' },
];
const NEED_PERSON = ['lent', 'borrowed', 'received', 'paid'];

function migrateV1toV2() {
  const oldTx = safeLoad('hisabx-transactions-v1', null);
  const oldAcc = safeLoad('hisabx-accounts-v1', null);
  const alreadyV2 = safeLoad('hisabx-transactions-v2', null);
  if (alreadyV2 !== null) return { accounts: safeLoad('hisabx-accounts-v2', []), transactions: alreadyV2 };
  if (oldTx !== null || oldAcc !== null) {
    safeSave('hisabx-backup-before-v2', { accounts: oldAcc, transactions: oldTx, migratedAt: new Date().toISOString() });
  }
  const accounts = Array.isArray(oldAcc) && oldAcc.length ? oldAcc : [
    { id: 'cash', name: 'হাতে নগদ', opening: 0 },
    { id: 'bkash', name: 'বিকাশ', opening: 0 },
    { id: 'bank', name: 'ব্যাংক', opening: 0 },
  ];
  const transactions = Array.isArray(oldTx) ? oldTx.filter(t => t && typeof t.amount === 'number' && t.type && t.id) : [];
  safeSave('hisabx-accounts-v2', accounts);
  safeSave('hisabx-transactions-v2', transactions);
  return { accounts, transactions };
}
export default function App() {
  const [migrated] = useState(() => migrateV1toV2());
  const [accounts, setAccounts] = useState(migrated.accounts);
  const [transactions, setTransactions] = useState(migrated.transactions);
  const [deletedLog, setDeletedLog] = useState(() => safeLoad('hisabx-deleted-v2', []));
  const [type, setType] = useState('income');
  const [account, setAccount] = useState('cash');
  const [toAccount, setToAccount] = useState('bkash');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => getLocalDate());
  const [editId, setEditId] = useState(null);
  const [newAccName, setNewAccName] = useState('');
  const [newAccOpening, setNewAccOpening] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { safeSave('hisabx-accounts-v2', accounts); }, [accounts]);
  useEffect(() => { safeSave('hisabx-transactions-v2', transactions); }, [transactions]);
  useEffect(() => { safeSave('hisabx-deleted-v2', deletedLog); }, [deletedLog]);

  const perPerson = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.person) return;
      if (!map[personKey(t.person)]) map[personKey(t.person)] = { receivable: 0, payable: 0 };
      const amt = toPaisa(t.amount);
      if (t.type === 'lent') map[personKey(t.person)].receivable += amt;
      if (t.type === 'received') map[personKey(t.person)].receivable -= amt;
      if (t.type === 'borrowed') map[personKey(t.person)].payable += amt;
      if (t.type === 'paid') map[personKey(t.person)].payable -= amt;
    });
    return map;
  }, [transactions]);

  const calc = useMemo(() => {
    const bal = {};
    accounts.forEach(a => { bal[a.id] = toPaisa(a.opening); });
    transactions.forEach(t => {
      const amt = toPaisa(t.amount);
      if (t.type === 'income') bal[t.account] = (bal[t.account] || 0) + amt;
      if (t.type === 'expense') bal[t.account] = (bal[t.account] || 0) - amt;
      if (t.type === 'lent') bal[t.account] = (bal[t.account] || 0) - amt;
      if (t.type === 'borrowed') bal[t.account] = (bal[t.account] || 0) + amt;
      if (t.type === 'received') bal[t.account] = (bal[t.account] || 0) + amt;
      if (t.type === 'paid') bal[t.account] = (bal[t.account] || 0) - amt;
      if (t.type === 'transfer') {
        bal[t.account] = (bal[t.account] || 0) - amt;
        bal[t.toAccount] = (bal[t.toAccount] || 0) + amt;
      }
    });
    let rec = 0, pay = 0;
    Object.values(perPerson).forEach(p => { rec += p.receivable; pay += p.payable; });
    const totalCashBank = Object.values(bal).reduce((s, v) => s + v, 0);
    const totalAssets = totalCashBank + rec;
    const totalLiabilities = pay;
    return { bal, totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, rec, pay };
  }, [transactions, accounts, perPerson]);

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(t => (t.person || '').toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q));
  }, [transactions, search]);

  const saveTx = () => {
    const _p = parseAmountToPaisa(amount); if(_p===null){alert("টাকার পরিমাণ ঠিক লিখুন — সর্বোচ্চ ২ ঘর দশমিক পর্যন্ত।"); return;} const amt = _p/100;
    if (!amt || amt <= 0) { alert('দয়া করে টাকার পরিমাণ লিখুন।'); return; }
    if (NEED_PERSON.includes(type) && !normalizePerson(person)) { alert('দয়া করে ব্যক্তির নাম লিখুন।'); return; }
    if (!accounts.find(a=>a.id===account)) { alert('অ্যাকাউন্ট পাওয়া যায়নি।'); return; } if (type === 'transfer' && !accounts.find(a=>a.id===toAccount)) { alert('গন্তব্য অ্যাকাউন্ট পাওয়া যায়নি।'); return; } if (type === 'transfer' && account === toAccount) { alert('একই অ্যাকাউন্টে স্থানান্তর হবে না।'); return; }
    const baseTx = editId ? transactions.filter(x => x.id !== editId) : transactions;
    const basePerPerson = {};
    baseTx.forEach(t => {
      if (!t.person) return;
      if (!basePerPerson[personKey(t.person)]) basePerPerson[personKey(t.person)] = { receivable: 0, payable: 0 };
      const a = toPaisa(t.amount);
      if (t.type === 'lent') basePerPerson[personKey(t.person)].receivable += a;
      if (t.type === 'received') basePerPerson[personKey(t.person)].receivable -= a;
      if (t.type === 'borrowed') basePerPerson[personKey(t.person)].payable += a;
      if (t.type === 'paid') basePerPerson[personKey(t.person)].payable -= a;
    });
    if (type === 'received') {
      const due = basePerPerson[personKey(person)]?.receivable || 0;
      if (toPaisa(amt) > due) { alert(`এই ব্যক্তির কাছে পাওনা আছে ৳ ${fmt(due)}। এর বেশি আদায় করা যাবে না।`); return; }
    }
    if (type === 'paid') {
      const due = basePerPerson[personKey(person)]?.payable || 0;
      if (toPaisa(amt) > due) { alert(`এই ব্যক্তিকে দিতে হবে ৳ ${fmt(due)}। এর বেশি পরিশোধ করা যাবে না।`); return; }
    }
    if (type === 'transfer' || type === 'expense' || type === 'lent' || type === 'paid') {
      let balPaisa = toPaisa(accounts.find(a => a.id === account)?.opening || 0);
      baseTx.forEach(t => {
        const a = toPaisa(t.amount);
        if (t.account === account) {
          if (['income', 'borrowed', 'received'].includes(t.type)) balPaisa += a;
          if (['expense', 'lent', 'paid'].includes(t.type)) balPaisa -= a;
          if (t.type === 'transfer') balPaisa -= a;
        }
        if (t.type === 'transfer' && t.toAccount === account) balPaisa += a;
      });
      if (toPaisa(amt) > balPaisa) { alert(`এই অ্যাকাউন্টে আছে ৳ ${fmt(balPaisa)}। এর বেশি খরচ / স্থানান্তর করা যাবে না।`); return; }
    }
    const tx = { id: editId || newId(), type, account, toAccount: type === 'transfer' ? toAccount : undefined, person: normalizePerson(person), amount: amt, note: note.trim(), date, updatedAt: new Date().toISOString() };
    const next = editId ? transactions.map(x => x.id === editId ? tx : x) : [tx, ...transactions]; if (hasNegativeLedger(next)) { alert("এই সম্পাদনায় কারো পাওনা/দেনা নেগেটিভ হয়ে যাবে — সংরক্ষণ হবে না।"); return; }
    setTransactions(next);
    safeSave('hisabx-transactions-v2', next);
    setAmount(''); setPerson(''); setNote(''); setEditId(null);
    alert(editId ? 'লেনদেন সম্পাদনা করা হয়েছে।' : 'লেনদেন সংরক্ষণ করা হয়েছে।');
  };


  const startEdit = (t) => {
    setEditId(t.id); setType(t.type); setAccount(t.account); setToAccount(t.toAccount || 'bkash');
    setPerson(t.person || ''); setAmount(String(t.amount)); setNote(t.note || ''); setDate(t.date || getLocalDate());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deleteTx = (id) => {
    if (!confirm('এই লেনদেনটি মুছে ফেলবেন?')) return;
    const found = transactions.find(x => x.id === id);
    const next = transactions.filter(x => x.id !== id); if (hasNegativeLedger(next)) { alert("এই লেনদেন মুছলে কারো পাওনা/দেনা নেগেটিভ হয়ে যাবে — মুছা যাবে না।"); return; }
    setTransactions(next);
    safeSave('hisabx-transactions-v2', next);
    if (found) setDeletedLog([{ ...found, deletedAt: new Date().toISOString() }, ...deletedLog].slice(0, 100));
  };
  const addAccount = () => {
    if (!newAccName.trim()) { alert('অ্যাকাউন্টের নাম লিখুন।'); return; } if (newAccOpening.trim()!=='' && parseAmountToPaisa(newAccOpening)===null) { alert('প্রারম্ভিক ব্যালেন্স ঠিক লিখুন — নেগেটিভ না, সর্বোচ্চ ২ ঘর দশমিক।'); return; }
    const acc = { id: newId(), name: newAccName.trim(), opening: (parseAmountToPaisa(newAccOpening || "0")===null ? -1 : parseAmountToPaisa(newAccOpening || "0")/100) };
    setAccounts([...accounts, acc]); setNewAccName(''); setNewAccOpening('');
  };
  const exportCSV = () => {
    const rows = [['তারিখ', 'ধরন', 'অ্যাকাউন্ট', 'ব্যক্তি', 'টাকা', 'বিবরণ']];
    transactions.forEach(t => rows.push([t.date, t.type, accounts.find(a => a.id === t.account)?.name || t.account, t.person || '', t.amount, (t.note || '')]));
    const csv = rows.map(r => r.map(c => JSON.stringify(String(c ?? ''))).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hisabx-' + getLocalDate() + '.csv'; a.click();
  };
  const exportJSON = () => {
    const data = { version: 2, exportedAt: new Date().toISOString(), accounts, transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hisabx-backup-' + getLocalDate() + '.json'; a.click();
  };
  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.accounts)) { alert('এই ফাইলটি সঠিক Backup ফাইল না।'); return; }
        if (!confirm('পুরোনো হিসাবের Backup নিয়ে তারপর নতুন হিসাব আনবেন? বর্তমান হিসাব বদলে যাবে।')) return;
        const _ids=new Set(data.accounts.map(a=>a.id)); if(!data.accounts.every(isValidAccount)||!data.transactions.every(tx=>isValidTx(tx,_ids))||hasNegativeLedger(data.transactions)){alert('Backup ফাইলে ভুল / নেগেটিভ হিসাব আছে — ফিরিয়ে আনা হয়নি।'); return;} if(!safeSave('hisabx-backup-before-import', { accounts, transactions, at: new Date().toISOString() })){alert('আগের হিসাবের Backup নেওয়া যায়নি — Restore বাতিল।'); return;}
        setAccounts(data.accounts); setTransactions(data.transactions);
        safeSave('hisabx-accounts-v2', data.accounts); safeSave('hisabx-transactions-v2', data.transactions);
        alert('Backup থেকে হিসাব ফিরিয়ে আনা হয়েছে।');
      } catch { alert('ফাইলটি পড়া যায়নি।'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const typeLabel = (t) => TYPES.find(x => x.id === t)?.name || t;

  return (
    <main style={{ minHeight: '100vh', background: '#0A1931', padding: 18, fontFamily: 'system-ui,"Noto Sans Bengali",sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>দৈনিক আমার হিসাবX</div>
          <div style={{ fontSize: 12, opacity: .7 }}>আপনার সব হিসাব, এক অ্যাপে</div>
        </div>
        <section style={{ background: 'linear-gradient(145deg,#fff,#dce8f5)', borderRadius: 24, padding: 20, color: '#0f172a', marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#475569' }}>আমার মোট সম্পত্তি</p>
          <h1 style={{ fontSize: 32, margin: '8px 0' }}>৳ {fmt(calc.netWorth)}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={{ background: '#0f766e', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট সম্পত্তি<br /><strong>৳ {fmt(calc.totalAssets)}</strong></div>
            <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট দায়<br /><strong>৳ {fmt(calc.totalLiabilities)}</strong></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 12 }}>
            {accounts.map(a => <div key={a.id} style={{ background: '#e2e8f0', padding: 8, borderRadius: 10, textAlign: 'center' }}>{a.name}<br /><strong>৳ {fmt(calc.bal[a.id] || 0)}</strong></div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            <div style={{ background: '#ede9fe', padding: 8, borderRadius: 10 }}>আমি পাবো<br /><strong>৳ {fmt(calc.rec)}</strong></div>
            <div style={{ background: '#fee2e2', padding: 8, borderRadius: 10 }}>আমি দেবো<br /><strong>৳ {fmt(calc.pay)}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={exportCSV} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#0f172a', color: '#fff', fontWeight: 700, border: 'none' }}>CSV Export</button>
            <button onClick={exportJSON} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#185ADB', color: '#fff', fontWeight: 700, border: 'none' }}>Backup (JSON)</button>
          </div>
          <label style={{ display: 'block', marginTop: 8, padding: 10, borderRadius: 10, background: '#fff', color: '#0f172a', textAlign: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Backup ফাইল থেকে ফিরিয়ে আনুন
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </section>

        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>{editId ? 'লেনদেন সম্পাদনা করুন' : '+ নতুন লেনদেন'}</h3>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>{TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <select value={account} onChange={e => setAccount(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          {type === 'transfer' && <select value={toAccount} onChange={e => setToAccount(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>{accounts.map(a => <option key={a.id} value={a.id}>→ {a.name}</option>)}</select>}
          <input value={person} onChange={e => setPerson(e.target.value)} placeholder="ব্যক্তির নাম" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="টাকার পরিমাণ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={date} onChange={e => setDate(e.target.value)} type="date" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="বিবরণ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 12 }} />
          <button onClick={saveTx} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#185ADB', color: '#fff', fontWeight: 800, border: 'none' }}>{editId ? 'সম্পাদনা সংরক্ষণ করুন' : 'হিসাব সংরক্ষণ করুন'}</button>
          {editId && <button onClick={() => { setEditId(null); setAmount(''); setPerson(''); setNote(''); }} style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 10, background: '#334155', color: '#fff', border: 'none' }}>বাতিল করুন</button>}
        </section>

        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px' }}>+ নতুন অ্যাকাউন্ট</h3>
          <input value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="অ্যাকাউন্টের নাম — যেমন: নগদ ২, ব্যাংক ২" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={newAccOpening} onChange={e => setNewAccOpening(e.target.value)} type="number" placeholder="প্রারম্ভিক ব্যালেন্স (থাকলে)" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <button onClick={addAccount} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#0f766e', color: '#fff', fontWeight: 800, border: 'none' }}>অ্যাকাউন্ট যোগ করুন</button>
        </section>

        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px' }}>ব্যক্তিভিত্তিক পাওনা / দেনা</h3>
          {Object.keys(perPerson).length === 0 && <p style={{ opacity: .7, fontSize: 13 }}>এখনো কারো সাথে ধার / পাওনা / দেনা নেই।</p>}
          {Object.entries(perPerson).map(([name, v]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e3a5f' }}>
              <span>{name}</span>
              <span>পাবো ৳ {fmt(v.receivable)} • দেবো ৳ {fmt(v.payable)}</span>
            </div>
          ))}
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px' }}>লেনদেনের ইতিহাস — {transactions.length}টি</h3>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="নাম / বিবরণ দিয়ে খুঁজুন..." style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 12, background: '#12294b', color: '#fff', border: '1px solid #1e3a5f' }} />
          {transactions.length === 0 && <p style={{ opacity: .7, fontSize: 13 }}>এখনো কোনো লেনদেন নেই।</p>}
          {filteredTx.map(t => (
            <div key={t.id} style={{ background: '#12294b', padding: 12, borderRadius: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontWeight: 700 }}>{typeLabel(t.type)}</div><div style={{ fontSize: 12, opacity: .7 }}>{t.person ? t.person + ' • ' : ''}{t.date} • {t.note} {t.type === 'transfer' ? ` • → ${accounts.find(a => a.id === t.toAccount)?.name || ''}` : ''}</div></div>
                <div style={{ fontWeight: 800 }}>৳ {Number(t.amount).toLocaleString('bn-BD')}</div>
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
