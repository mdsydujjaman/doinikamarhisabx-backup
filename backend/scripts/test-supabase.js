import 'dotenv/config';

import {
  connectSupabaseDatabase,
  getSupabaseDatabase,
  getSupabaseStatus,
  closeSupabaseDatabase
} from '../src/supabase-database.js';

let exitCode = 0;

try {
  const connected = await connectSupabaseDatabase();

  if (!connected) {
    throw new Error('Supabase connection was not established.');
  }

  const sql = getSupabaseDatabase();

  const result = await sql`
    SELECT
      1 AS connection_test,
      current_database() AS database_name,
      current_user AS database_user
  `;

  if (Number(result[0].connection_test) !== 1) {
    throw new Error('SQL verification failed.');
  }

  console.log('SUPABASE ADAPTER TEST: PASS');
  console.log('CONNECTION STATUS:', getSupabaseStatus().state);
  console.log('QUERY TEST: PASS');
  console.log('DATABASE:', result[0].database_name);
  console.log('USER:', result[0].database_user);
} catch (error) {
  exitCode = 1;
  console.error('SUPABASE ADAPTER TEST: FAILED');
  console.error('ERROR TYPE:', error.name || 'UnknownError');
} finally {
  try {
    await closeSupabaseDatabase();
  } catch {
    console.error('WARNING: Database client close failed.');
    exitCode = 1;
  }
}

process.exitCode = exitCode;
