import postgres from 'postgres';

let sql;
let connectionState = 'not_configured';

export function getSupabaseStatus() {
  return {
    ready: connectionState === 'connected' && Boolean(sql),
    state: connectionState
  };
}

export function getSupabaseDatabase() {
  if (!sql || connectionState !== 'connected') {
    throw new Error('Supabase database is not connected.');
  }

  return sql;
}

export async function connectSupabaseDatabase() {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    connectionState = 'not_configured';
    console.warn('Supabase DATABASE_URL is not configured.');
    return false;
  }

  let parsed;

  try {
    parsed = new URL(uri);
  } catch {
    connectionState = 'configuration_failed';
    console.error('Supabase DATABASE_URL format is invalid.');
    return false;
  }

  if (
    !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
    !parsed.hostname.endsWith('.pooler.supabase.com') ||
    parsed.port !== '5432' ||
    parsed.pathname !== '/postgres' ||
    !parsed.username ||
    !parsed.password
  ) {
    connectionState = 'configuration_failed';
    console.error('Supabase Session Pooler configuration is invalid.');
    return false;
  }

  connectionState = 'connecting';

  const client = postgres(uri, {
    ssl: 'require',
    connect_timeout: 15,
    idle_timeout: 20,
    max: 5,
    prepare: false
  });

  try {
    await client`SELECT 1`;
    sql = client;
    connectionState = 'connected';
    console.log('Supabase PostgreSQL connection verified.');
    return true;
  } catch (error) {
    connectionState = 'connection_failed';

    try {
      await client.end({ timeout: 5 });
    } catch {
      // Preserve the original connection failure.
    }

    console.error(
      'Supabase connection failed. Error code:',
      error.code || 'UNAVAILABLE'
    );

    return false;
  }
}

export async function closeSupabaseDatabase() {
  const currentClient = sql;
  sql = undefined;
  connectionState = 'disconnected';

  if (currentClient) {
    await currentClient.end({ timeout: 5 });
  }
}
