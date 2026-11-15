import { useState } from 'react';
import { syncTxToSupabase, syncAccountToSupabase, loadFromSupabase } from './supabaseSync.js';
export function useStep3Files() {
  const [showPawna, setShowPawna] = useState(false);
  const [showDena, setShowDena] = useState(false);
  return { showPawna, setShowPawna, showDena, setShowDena };
}
export const step3Btn3D = (color) => ({
  padding: '6px 4px', fontSize: 11, borderRadius: 8, border: 'none', cursor: 'pointer',
  color: '#fff', background: color,
  boxShadow: '0 3px 0 rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.2)',
});
export const step3Colors = { pawna: '#7c3aed', dena: '#ec4899', account: '#f97316', history: '#059669', search: '#0284c7', sync: '#dc2626' };
export async function syncAllToSupabase(accounts, transactions) {
  if (!confirm('সব একাউন্ট + লেনদেন Supabase-এ পাঠাবেন? Local ডাটা মুছবে না।')) return null;
  let okA = 0, okT = 0;
  for (const a of accounts) { try { await syncAccountToSupabase(a); okA++; } catch (e) {} }
  for (const tx of transactions) { try { await syncTxToSupabase(tx); okT++; } catch (e) {} }
  alert('Bulk Sync শেষ — একাউন্ট: ' + okA + '/' + accounts.length + ', লেনদেন: ' + okT + '/' + transactions.length);
  return { okA, okT };
}
export async function loadAllFromSupabase() {
  if (!confirm('Supabase থেকে সব হিসাব এনে Local-এ বসাবেন? আগে Backup নিয়ে নিন।')) return null;
  const sb = await loadFromSupabase();
  alert('Supabase থেকে আনা হইছে — একাউন্ট: ' + sb.accounts.length + ', লেনদেন: ' + sb.transactions.length);
  return sb;
}
