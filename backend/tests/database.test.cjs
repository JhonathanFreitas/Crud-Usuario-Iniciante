const { test } = require('node:test');
const assert = require('node:assert/strict');

function carregar(url) {
  process.env.DATABASE_URL = url;
  delete require.cache[require.resolve('../dist/src/config/database')];
  return require('../dist/src/config/database').getDatabase;
}

test('configuração rejeita URLs ausentes, HTTP e senha não preenchida', () => {
  for (const value of ['', 'url-invalida', 'https://teste.supabase.co',
    'postgresql://postgres@localhost/postgres',
    'postgresql://postgres:[YOUR-PASSWORD]@localhost/postgres']) {
    assert.throws(() => carregar(value)(), /DATABASE_URL/);
  }
});

test('link PostgreSQL mantém senha codificada, pool limitado e TLS verificado', async () => {
  const pool = carregar('postgresql://postgres.projeto:p%40ss%23word@host.pooler.supabase.com:5432/postgres?sslmode=require')();
  try {
    const url = new URL(pool.options.connectionString);
    assert.equal(decodeURIComponent(url.password), 'p@ss#word');
    assert.equal(url.searchParams.has('sslmode'), false);
    assert.equal(pool.options.ssl.rejectUnauthorized, true);
    assert.ok(pool.options.ssl.ca.some(cert => cert.includes('-----BEGIN CERTIFICATE-----')));
    assert.equal(pool.options.max, 5);
  } finally {
    await pool.end();
  }
});
