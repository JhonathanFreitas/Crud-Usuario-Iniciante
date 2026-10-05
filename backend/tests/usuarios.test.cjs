const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL = 'postgresql://postgres:senha-teste@db.crud-test.supabase.co:5432/postgres';

const originalFetch = global.fetch;
let usuarios = [];
let nextId = 1;
let failDatabase = false;
let endpoint;
let server;

const { Pool } = require('pg');
const originalQuery = Pool.prototype.query;

// Simula somente o banco; as rotas, validações e consultas parametrizadas são reais.
Pool.prototype.query = async (sql, valores = []) => {
  assert.match(sql, /public\.usuarios/);
  if (failDatabase) {
    throw Object.assign(new Error('detalhe privado do banco'), { code: '42P01' });
  }
  const method = sql.split(' ')[0];
  const id = method === 'UPDATE' ? valores[3] : valores[0];
  let result = id === undefined ? [...usuarios] : usuarios.filter(u => u.id === id);
  if (method === 'SELECT' && sql.includes('nome ILIKE')) {
    assert.match(sql, /nome ILIKE \$1/);
    assert.equal(valores.length, 1);
    assert.ok(!sql.includes(valores[0]));
    const termo = valores[0].slice(1, -1).toLowerCase();
    result = usuarios.filter(u => u.nome.toLowerCase().includes(termo));
  }
  if (method === 'INSERT' || method === 'UPDATE') {
    const dados = { nome: valores[0], email: valores[1], ativo: valores[2] };
    assert.ok(!sql.includes(dados.nome));
    assert.ok(!sql.includes(dados.email));
    assert.match(sql, /\$1/);
    if (usuarios.some(u => u.email === dados.email && (method === 'INSERT' || u.id !== id))) {
      throw Object.assign(new Error('duplicate key'), { code: '23505' });
    }
    if (method === 'INSERT') {
      const usuario = { ...dados, id: nextId++ };
      usuarios.push(usuario);
      result = [usuario];
    } else {
      result.forEach(u => Object.assign(u, dados));
    }
  }
  if (method === 'DELETE') usuarios = usuarios.filter(u => u.id !== id);
  return { rows: result };
};

before(async () => {
  const app = require('../dist/src/app').default;
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  endpoint = `http://127.0.0.1:${server.address().port}/usuarios`;
});

after(async () => {
  Pool.prototype.query = originalQuery;
  await require('../dist/src/config/database').getDatabase().end();
  await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
});

async function request(path = '', method = 'GET', body) {
  return originalFetch(endpoint + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

test('CRUD completo, normalização, duplicidade e registros inexistentes', async () => {
  assert.deepEqual(await (await request()).json(), []);
  const created = await request('', 'POST', { nome: ' Ana ', email: ' ANA@EXEMPLO.COM ', ativo: true, id: 999 });
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), { id: 1, nome: 'Ana', email: 'ana@exemplo.com', ativo: true });
  assert.equal((await (await request()).json()).length, 1);
  assert.equal((await request('/1')).status, 200);
  assert.equal((await request('', 'POST', { nome: 'Outra', email: 'ana@exemplo.com', ativo: true })).status, 400);
  assert.equal((await request('', 'POST', { nome: 'Bia', email: 'bia@exemplo.com', ativo: true })).status, 201);
  assert.equal((await request('/2', 'PUT', { nome: 'Bia', email: 'ana@exemplo.com', ativo: true })).status, 400);
  const updated = await request('/1', 'PUT', { nome: 'Ana Nova', email: 'ana@exemplo.com', ativo: false });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).ativo, false);
  assert.equal((await request('/1', 'DELETE')).status, 204);
  assert.equal((await request('/1')).status, 404);
  assert.equal((await request('/1', 'DELETE')).status, 404);
  assert.equal((await request('/1', 'PUT', { nome: 'Ana', email: 'ana@exemplo.com', ativo: true })).status, 404);
});

test('validação de ID e dados preserva HTTP 400', async () => {
  assert.equal((await request('/abc')).status, 400);
  assert.equal((await request('', 'POST', [])).status, 400);
  for (const dados of [
    { nome: '', email: 'ana@exemplo.com', ativo: true },
    { nome: 'Ana', email: 'invalido', ativo: true },
    { nome: 'Ana', email: 'ana@exemplo.com', ativo: 'true' }
  ]) assert.equal((await request('', 'POST', dados)).status, 400);
});

test('busca por nome aceita trecho, ignora caixa e espaços, e limpa o filtro', async () => {
  await request('', 'POST', { nome: 'Ana Maria', email: 'maria@exemplo.com', ativo: true });
  const filtrados = await request('?nome=MAR');
  assert.equal(filtrados.status, 200);
  assert.deepEqual((await filtrados.json()).map(u => u.nome), ['Ana Maria']);
  assert.deepEqual((await (await request('?nome=%20bia%20')).json()).map(u => u.nome), ['Bia']);
  assert.deepEqual(await (await request('?nome=inexistente')).json(), []);
  assert.equal((await (await request('?nome=%20%20')).json()).length, 2);
  assert.equal((await (await request('?nome=')).json()).length, 2);
  assert.deepEqual(await (await request('?nome=' + encodeURIComponent("' OR 1=1 --"))).json(), []);
  assert.equal((await request('?nome=a&nome=b')).status, 400);
});

test('falhas do banco chegam ao middleware sem expor detalhes', async () => {
  failDatabase = true;
  const previousConsoleError = console.error;
  console.error = () => {};
  try {
    for (const [path, method, body] of [
      ['', 'GET'], ['?nome=Bia', 'GET'], ['/2', 'GET'],
      ['', 'POST', { nome: 'Ana', email: 'ana@exemplo.com', ativo: true }],
      ['/2', 'PUT', { nome: 'Ana', email: 'ana@exemplo.com', ativo: true }],
      ['/2', 'DELETE']
    ]) {
      const response = await request(path, method, body);
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { mensagem: 'Erro interno no servidor' });
    }
  } finally {
    failDatabase = false;
    console.error = previousConsoleError;
  }
});
