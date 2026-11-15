import { supabase } from './supabaseClient.js'

export async function syncTxToSupabase(tx) {
  const row = {
    id: tx.id,
    account_id: tx.account,
    to_account_id: tx.toAccount || null,
    type: tx.type,
    amount_paisa: tx.amountPaisa,
    person: tx.person || '',
    person_id: tx.personId || null,
    note: tx.note || '',
    date: tx.date,
    time: tx.time || '00:00',
    receipt_date: tx.receiptDate || tx.date,
    seq: tx.seq || null,
    payment_method: tx.paymentMethod || null,
    custom_payment_method: tx.customPaymentMethod || null,
  }
  const { error } = await supabase.from('transactions').upsert(row, { onConflict: 'id' })
  if (error) throw error
}

export async function syncAccountToSupabase(a) {
  const row = {
    id: a.id,
    name: a.name,
    preset: a.preset || null,
    preset_label: a.presetLabel || null,
    kind: a.kind || null,
    opening: Math.round(Number(a.opening || 0)),
    opening_paisa: a.openingPaisa ?? Math.round(Number(a.opening || 0) * 100),
    opening_date: a.openingDate || null,
  }
  const { error } = await supabase.from('accounts').upsert(row, { onConflict: 'id' })
  if (error) throw error
}

export async function deleteTxFromSupabase(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function loadFromSupabase() {
  const { data: accs, error: e1 } = await supabase.from('accounts').select('*')
  if (e1) throw e1
  const { data: txs, error: e2 } = await supabase.from('transactions').select('*').order('date', { ascending: true })
  if (e2) throw e2
  const normalizePerson = (v) => String(v || '').trim().replace(/\s+/g, ' ');
  const personKey = (v) => normalizePerson(v).toLowerCase();
  const personsByKey = new Map();
  for (const t of (txs || [])) {
    const nm = normalizePerson(t.person || '');
    if (!nm) continue;
    const k = personKey(nm);
    if (!personsByKey.has(k)) personsByKey.set(k, { id: t.person_id || ('person-' + k), name: nm, key: k });
    else if (t.person_id && personsByKey.get(k).id.startsWith('person-')) personsByKey.get(k).id = t.person_id;
  }
  const persons = [...personsByKey.values()];
  const accounts = (accs || []).map(a => ({ id: a.id, name: a.name, preset: a.preset, presetLabel: a.preset_label, kind: a.kind, opening: (a.opening_paisa ?? 0) / 100, openingPaisa: a.opening_paisa ?? 0, openingDate: a.opening_date || undefined }))
  const transactions = (txs || []).map(t => {
    const nm = normalizePerson(t.person || '');
    const pid = nm ? (t.person_id || personsByKey.get(personKey(nm))?.id || undefined) : undefined;
    return { id: t.id, account: t.account_id, toAccount: t.type === 'transfer' ? (t.to_account_id || undefined) : undefined, type: t.type, amountPaisa: t.amount_paisa, amount: (t.amount_paisa ?? 0) / 100, person: t.person || '', personId: pid, note: t.note || '', date: t.date, time: t.time || '00:00', receiptDate: t.receipt_date || t.date, seq: t.seq ?? undefined, paymentMethod: t.payment_method || undefined, customPaymentMethod: t.custom_payment_method || undefined };
  });
  return { accounts, transactions, persons };
}
