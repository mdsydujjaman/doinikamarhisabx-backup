import { useState, useEffect } from 'react';

const ACCOUNTS = [
  { id: 'cash', name: 'হাতে নগদ' },
  { id: 'bkash', name: 'বিকাশ' },
  { id: 'bank', name: 'ব্যাংক' },
];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('hisabx-transactions-v1');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [type, setType] = useState('income');
  const [account, setAccount] = useState('cash');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('hisabx-transactions-v1', JSON.stringify(transactions));
  }, [transactions]);

  const balanceByAccount = {};
  ACCOUNTS.forEach(a => balanceByAccount[a.id] = 0);
  let totalReceivable = 0;
  let totalPayable = 0;

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') { balanceByAccount[t.account] += amt; }
    if (t.type === 'expense') { balanceByAccount[t.account] -= amt; }
    if (t.type === 'lent') { balanceByAccount[t.account] -= amt; totalReceivable += amt; }
    if (t.type === 'borrowed') { balanceByAccount[t.account] += amt; totalPayable += amt; }
    if (t.type === 'received') { totalReceivable -= amt; balanceByAccount[t.account] += amt; }
    if (t.type === 'paid') { totalPayable -= amt; balanceByAccount[t.account] -= amt; }
  });

  const totalCashBank = balanceByAccount.cash + balanceByAccount.bkash + balanceByAccount.bank;
  const totalAssets = totalCashBank + totalReceivable;
  const totalLiabilities = totalPayable;
  const netWorth = totalAssets - totalLiabilities;

  const addTransaction = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { alert('দয়া করে টাকার পরিমাণ লিখুন।'); return; }
    if ((type === 'lent' || type === 'borrowed' || type === 'received' || type === 'paid') && !person.trim()) {
      alert('দয়া করে ব্যক্তির নাম লিখুন।'); return;
    }
    const newTx = { id: Date.now().toString(), type, account, person: person.trim(), amount: amt, note: note.trim(), date: new Date().toISOString().slice(0, 10) };
    setTransactions([newTx, ...transactions]);
    setAmount(''); setPerson(''); setNote('');
    alert('লেনদেন সংরক্ষণ করা হয়েছে।');
  };

  const typeLabel = (t) => {
    if (t === 'income') return 'আয়';
    if (t === 'expense') return 'ব্যয়';
    if (t === 'lent') return 'আমি টাকা দিলাম';
    if (t === 'borrowed') return 'আমি টাকা নিলাম';
    if (t === 'received') return 'পাওনা পেলাম';
    if (t === 'paid') return 'দেনা পরিশোধ করলাম';
    return t;
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A1931', padding: 18, fontFamily: 'system-ui,"Noto Sans Bengali",sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>দৈনিক আমার হিসাবX</div>
          <div style={{ fontSize: 12, opacity: .7 }}>আপনার সব হিসাব, এক অ্যাপে</div>
        </div>

        <section style={{ background: 'linear-gradient(145deg,#fff,#dce8f5)', borderRadius: 24, padding: 20, color: '#0f172a', marginBottom: 16 }}>
          <p style={{ margin: 0, color: '#475569' }}>আমার মোট সম্পত্তি</p>
          <h1 style={{ fontSize: 32, margin: '8px 0' }}>৳ {netWorth.toLocaleString('bn-BD')}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={{ background: '#0f766e', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট সম্পত্তি<br /><strong>৳ {totalAssets.toLocaleString('bn-BD')}</strong></div>
            <div style={{ background: '#dc2626', color: '#fff', padding: 12, borderRadius: 12, textAlign: 'center' }}>মোট দায়<br /><strong>৳ {totalLiabilities.toLocaleString('bn-BD')}</strong></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, fontSize: 12, textAlign: 'center' }}>
            <div style={{ background: '#e2e8f0', padding: 8, borderRadius: 10 }}>হাতে নগদ<br /><strong>৳ {balanceByAccount.cash.toLocaleString('bn-BD')}</strong></div>
            <div style={{ background: '#e2e8f0', padding: 8, borderRadius: 10 }}>বিকাশ<br /><strong>৳ {balanceByAccount.bkash.toLocaleString('bn-BD')}</strong></div>
            <div style={{ background: '#e2e8f0', padding: 8, borderRadius: 10 }}>ব্যাংক<br /><strong>৳ {balanceByAccount.bank.toLocaleString('bn-BD')}</strong></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            <div style={{ background: '#ede9fe', padding: 8, borderRadius: 10 }}>আমি পাবো<br /><strong>৳ {totalReceivable.toLocaleString('bn-BD')}</strong></div>
            <div style={{ background: '#fee2e2', padding: 8, borderRadius: 10 }}>আমি দেবো<br /><strong>৳ {totalPayable.toLocaleString('bn-BD')}</strong></div>
          </div>
        </section>

        <section style={{ background: '#12294b', borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px' }}>+ নতুন লেনদেন</h3>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>
            <option value="income">আয়</option>
            <option value="expense">ব্যয়</option>
            <option value="lent">আমি টাকা দিলাম</option>
            <option value="borrowed">আমি টাকা নিলাম</option>
            <option value="received">পাওনা পেলাম</option>
            <option value="paid">দেনা পরিশোধ করলাম</option>
          </select>
          <select value={account} onChange={e => setAccount(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }}>
            {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input value={person} onChange={e => setPerson(e.target.value)} placeholder="ব্যক্তির নাম" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="টাকার পরিমাণ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 10 }} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="বিবরণ" style={{ width: '100%', padding: 12, borderRadius: 10, marginBottom: 12 }} />
          <button onClick={addTransaction} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#185ADB', color: '#fff', fontWeight: 800, border: 'none' }}>হিসাব সংরক্ষণ করুন</button>
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px' }}>লেনদেনের ইতিহাস — {transactions.length}টি</h3>
          {transactions.length === 0 && <p style={{ opacity: .7, fontSize: 13 }}>এখনো কোনো লেনদেন নেই।</p>}
          {transactions.map(t => (
            <div key={t.id} style={{ background: '#12294b', padding: 12, borderRadius: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontWeight: 700 }}>{typeLabel(t.type)}</div><div style={{ fontSize: 12, opacity: .7 }}>{t.person ? t.person + ' • ' : ''}{t.date} • {t.note}</div></div>
              <div style={{ fontWeight: 800 }}>৳ {Number(t.amount).toLocaleString('bn-BD')}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
