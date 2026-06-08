import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path for local database file backup
const DB_FILE_PATH = path.join(process.cwd(), 'data.json');

// Initialize local seed data
const initialSeedData = {
  alunos: [
    {
      id: "a1",
      nome: "Carlos Eduardo Silva",
      email: "carlos.silva@example.com",
      telefone: "(11) 98765-4321",
      plano: "Anual",
      status: "Ativo",
      data_cadastro: "2026-01-15T14:30:00Z",
      data_vencimento: "2027-01-15T00:00:00Z"
    },
    {
      id: "a2",
      nome: "Mariana Costa Santos",
      email: "mari.costa@example.com",
      telefone: "(11) 97654-3210",
      plano: "Mensal",
      status: "Ativo",
      data_cadastro: "2026-04-20T10:15:00Z",
      data_vencimento: "2026-06-20T00:00:00Z"
    },
    {
      id: "a3",
      nome: "Rodrigo Almeida",
      email: "rodrigo.almeida@example.com",
      telefone: "(21) 99887-7665",
      plano: "Semestral",
      status: "Ativo",
      data_cadastro: "2026-02-10T11:00:00Z",
      data_vencimento: "2026-08-10T00:00:00Z"
    },
    {
      id: "a4",
      nome: "Ana Beatriz Martins",
      email: "ana.martins@example.com",
      telefone: "(31) 99443-2211",
      plano: "Mensal",
      status: "Inativo",
      data_cadastro: "2025-11-05T09:45:00Z",
      data_vencimento: "2025-12-05T00:00:00Z"
    },
    {
      id: "a5",
      nome: "Fernanda Lima de Oliveira",
      email: "fepa.lima@example.com",
      telefone: "(11) 95554-3322",
      plano: "Trimestral",
      status: "Ativo",
      data_cadastro: "2026-03-25T16:20:00Z",
      data_vencimento: "2026-06-25T00:00:00Z"
    }
  ],
  estoque: [
    {
      id: "p1",
      nome: "Whey Protein Isolado 900g (Chocolate)",
      categoria: "Suplementos",
      quantidade: 15,
      preco: 149.90,
      preco_custo: 95.00,
      estoque_minimo: 5,
      fornecedor: "NutriBrasil S.A."
    },
    {
      id: "p2",
      nome: "Creatina Monohidratada 300g",
      categoria: "Suplementos",
      quantidade: 3,
      preco: 89.90,
      preco_custo: 45.00,
      estoque_minimo: 8,
      fornecedor: "NutriBrasil S.A."
    },
    {
      id: "p3",
      nome: "Garrafa Térmica 750ml (Inox)",
      categoria: "Acessórios",
      quantidade: 22,
      preco: 45.00,
      preco_custo: 18.00,
      estoque_minimo: 4,
      fornecedor: "SportBrindes LTDA"
    },
    {
      id: "p4",
      nome: "Strap Academia Couro (Par)",
      categoria: "Acessórios",
      quantidade: 12,
      preco: 39.90,
      preco_custo: 15.00,
      estoque_minimo: 3,
      fornecedor: "IronGrip Co."
    },
    {
      id: "p5",
      nome: "Camiseta Dry-Fit Gym Division - G",
      categoria: "Vestuário",
      quantidade: 18,
      preco: 59.90,
      preco_custo: 22.50,
      estoque_minimo: 5,
      fornecedor: "Estilo & Fit Têxtil"
    }
  ],
  vendas: [
    {
      id: "v1",
      produto_id: "p1",
      produto_nome: "Whey Protein Isolado 900g (Chocolate)",
      quantidade: 1,
      total: 149.90,
      comprador: "Carlos Eduardo Silva",
      data_venda: "2026-05-18T15:30:00Z"
    },
    {
      id: "v2",
      produto_id: "p3",
      produto_nome: "Garrafa Térmica 750ml (Inox)",
      quantidade: 2,
      total: 90.00,
      comprador: "Mariana Costa Santos",
      data_venda: "2026-05-19T11:20:00Z"
    },
    {
      id: "v3",
      produto_id: "p5",
      produto_nome: "Camiseta Dry-Fit Gym Division - G",
      quantidade: 1,
      total: 59.90,
      comprador: "Visitante",
      data_venda: "2026-05-20T17:45:00Z"
    }
  ]
};

// Initialize file database if it doesn't exist
if (!fs.existsSync(DB_FILE_PATH)) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialSeedData, null, 2), 'utf-8');
}

// Read database from file system
function getLocalDB() {
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler banco local, recriando...", err);
    return initialSeedData;
  }
}

// Write database to file system
function saveLocalDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Erro ao salvar banco local:", err);
    return false;
  }
}

// Config Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "" &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key"
);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// Helper to check table connectivity and fall back gracefully
async function checkSupabaseStatus() {
  if (!supabase) return { configured: false, connected: false, tablesFound: false, error: "Credenciais ausentes" };
  try {
    const { data, error } = await supabase.from('alunos').select('id').limit(1);
    if (error) {
      // Check if it's a table relation failure (meaning table doesn't exist yet but DB responds)
      if (error.code === 'PGRST116' || error.message?.includes('relation "alunos" does not exist')) {
        return { configured: true, connected: true, tablesFound: false, error: "Tabela 'alunos' não encontrada no banco. Crie as tabelas usando o script SQL fornecido." };
      }
      return { configured: true, connected: false, tablesFound: false, error: error.message };
    }
    return { configured: true, connected: true, tablesFound: true };
  } catch (err: any) {
    return { configured: true, connected: false, tablesFound: false, error: err.message || "Erro desconhecido" };
  }
}

// SQL schema for user to execute
const SQL_SCHEMA = `-- Copie e execute este script no Editor SQL do seu painel do Supabase:

-- Criar tabela de Alunos
create table if not exists alunos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text,
  telefone text,
  plano text not null checks (plano in ('Mensal', 'Trimestral', 'Semestral', 'Anual')),
  status text not null checks (status in ('Ativo', 'Inativo')),
  data_cadastro timestamp with time zone default timezone('utc'::text, now()) not null,
  data_vencimento timestamp with time zone not null
);

-- Criar tabela de Estoque
create table if not exists estoque (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  categoria text,
  quantidade integer not null default 0,
  preco numeric(10,2) not null default 0.00,
  preco_custo numeric(10,2) not null default 0.00,
  estoque_minimo integer not null default 5,
  fornecedor text
);

-- Criar tabela de Vendas
create table if not exists vendas (
  id uuid default gen_random_uuid() primary key,
  produto_id uuid references estoque(id) on delete set null,
  produto_nome text not null,
  quantidade integer not null default 1,
  total numeric(10,2) not null default 0.00,
  comprador text not null,
  data_venda timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar acesso público / burlar RLS (ideal para demonstrações, controle via API do app ou desative se necessário)
alter table alunos enable row level security;
alter table estoque enable row level security;
alter table vendas enable row level security;

create policy "Acesso livre alunos" on alunos for all using (true) with check (true);
create policy "Acesso livre estoque" on estoque for all using (true) with check (true);
create policy "Acesso livre vendas" on vendas for all using (true) with check (true);
`;

// Endpoints API

// GET Connection info
app.get('/api/config', async (req, res) => {
  const status = await checkSupabaseStatus();
  res.json({
    useSupabase: (status.connected && status.tablesFound),
    supabaseStatus: status,
    sqlSchema: SQL_SCHEMA,
    supabaseInfo: {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : undefined,
    }
  });
});

// GET Alunos
app.get('/api/alunos', async (req, res) => {
  const status = await checkSupabaseStatus();
  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error("Erro ao buscar alunos no Supabase, usando backup local:", err.message);
    }
  }
  
  // Local file database backup
  const db = getLocalDB();
  res.json(db.alunos);
});

// POST Aluno
app.post('/api/alunos', async (req, res) => {
  const novoAluno = req.body;
  const status = await checkSupabaseStatus();
  
  // Set default properties
  const idValue = novoAluno.id || 'aluno_' + Math.random().toString(36).substr(2, 9);
  const cadastroValue = novoAluno.data_cadastro || new Date().toISOString();
  
  const alunoFormatado = {
    nome: novoAluno.nome,
    email: novoAluno.email || "",
    telefone: novoAluno.telefone || "",
    plano: novoAluno.plano || "Mensal",
    status: novoAluno.status || "Ativo",
    data_cadastro: cadastroValue,
    data_vencimento: novoAluno.data_vencimento
  };

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .insert([alunoFormatado])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err: any) {
      console.error("Erro ao cadastrar aluno no Supabase, gravando localmente:", err.message);
    }
  }

  // Backup Local write
  const db = getLocalDB();
  const alunoParaSalvar = { id: idValue, ...alunoFormatado };
  db.alunos.push(alunoParaSalvar);
  saveLocalDB(db);
  res.status(201).json(alunoParaSalvar);
});

// PUT Aluno
app.put('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;
  const status = await checkSupabaseStatus();

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .update({
          nome: dadosAtualizados.nome,
          email: dadosAtualizados.email,
          telefone: dadosAtualizados.telefone,
          plano: dadosAtualizados.plano,
          status: dadosAtualizados.status,
          data_vencimento: dadosAtualizados.data_vencimento
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error("Erro ao atualizar aluno no Supabase, usando alteração local:", err.message);
    }
  }

  // Backup Local update
  const db = getLocalDB();
  const index = db.alunos.findIndex((a: any) => a.id === id);
  if (index !== -1) {
    db.alunos[index] = { ...db.alunos[index], ...dadosAtualizados };
    saveLocalDB(db);
    res.json(db.alunos[index]);
  } else {
    res.status(404).json({ error: "Aluno não encontrado" });
  }
});

// DELETE Aluno
app.delete('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const status = await checkSupabaseStatus();

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Erro ao apagar aluno no Supabase, usando remoção local:", err.message);
    }
  }

  // Backup Local delete
  const db = getLocalDB();
  db.alunos = db.alunos.filter((a: any) => a.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});

// GET Estoque
app.get('/api/estoque', async (req, res) => {
  const status = await checkSupabaseStatus();
  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error("Erro ao buscar estoque no Supabase, usando backup local:", err.message);
    }
  }

  // Local file database backup
  const db = getLocalDB();
  res.json(db.estoque);
});

// POST Produto
app.post('/api/estoque', async (req, res) => {
  const novoProduto = req.body;
  const status = await checkSupabaseStatus();

  const idValue = novoProduto.id || 'prod_' + Math.random().toString(36).substr(2, 9);
  const prodFormatado = {
    nome: novoProduto.nome,
    categoria: novoProduto.categoria || "Acessórios",
    quantidade: Number(novoProduto.quantidade || 0),
    preco: Number(novoProduto.preco || 0),
    preco_custo: Number(novoProduto.preco_custo || 0),
    estoque_minimo: Number(novoProduto.estoque_minimo || 5),
    fornecedor: novoProduto.fornecedor || ""
  };

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .insert([prodFormatado])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err: any) {
      console.error("Erro ao cadastrar produto no Supabase, gravando localmente:", err.message);
    }
  }

  // Backup Local write
  const db = getLocalDB();
  const prodParaSalvar = { id: idValue, ...prodFormatado };
  db.estoque.push(prodParaSalvar);
  saveLocalDB(db);
  res.status(201).json(prodParaSalvar);
});

// PUT Produto (Edição / Reposição de estoque)
app.put('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;
  const status = await checkSupabaseStatus();

  const extraFields: any = {};
  if (dadosAtualizados.nome !== undefined) extraFields.nome = dadosAtualizados.nome;
  if (dadosAtualizados.categoria !== undefined) extraFields.categoria = dadosAtualizados.categoria;
  if (dadosAtualizados.preco !== undefined) extraFields.preco = Number(dadosAtualizados.preco);
  if (dadosAtualizados.preco_custo !== undefined) extraFields.preco_custo = Number(dadosAtualizados.preco_custo);
  if (dadosAtualizados.estoque_minimo !== undefined) extraFields.estoque_minimo = Number(dadosAtualizados.estoque_minimo);
  if (dadosAtualizados.fornecedor !== undefined) extraFields.fornecedor = dadosAtualizados.fornecedor;
  if (dadosAtualizados.quantidade !== undefined) extraFields.quantidade = Number(dadosAtualizados.quantidade);

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .update(extraFields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error("Erro ao atualizar produto no Supabase, usando backup local:", err.message);
    }
  }

  // Backup Local update
  const db = getLocalDB();
  const index = db.estoque.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.estoque[index] = { ...db.estoque[index], ...extraFields };
    saveLocalDB(db);
    res.json(db.estoque[index]);
  } else {
    res.status(404).json({ error: "Produto não encontrado" });
  }
});

// DELETE Produto
app.delete('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const status = await checkSupabaseStatus();

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Erro ao remover produto no Supabase, removendo localmente:", err.message);
    }
  }

  // Backup Local delete
  const db = getLocalDB();
  db.estoque = db.estoque.filter((p: any) => p.id !== id);
  saveLocalDB(db);
  res.json({ success: true });
});

// GET Vendas
app.get('/api/vendas', async (req, res) => {
  const status = await checkSupabaseStatus();
  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .order('data_venda', { ascending: false });
      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error("Erro ao buscar vendas no Supabase, usando backup local:", err.message);
    }
  }

  // Local file database backup
  const db = getLocalDB();
  res.json(db.vendas);
});

// POST Venda (Registrar venda e dar baixa no estoque)
app.post('/api/vendas', async (req, res) => {
  const novaVenda = req.body; // { produto_id, quantidade, total, comprador }
  const status = await checkSupabaseStatus();

  const idValue = 'venda_' + Math.random().toString(36).substr(2, 9);
  const dataVendaValue = new Date().toISOString();

  // Find product details
  let produtoNome = novaVenda.produto_nome || "Produto Avulso";
  let produtoId = novaVenda.produto_id || null;

  // Let's connect with db
  const db = getLocalDB();
  let productIndex = -1;

  if (produtoId) {
    productIndex = db.estoque.findIndex((p: any) => p.id === produtoId);
    if (productIndex !== -1) {
      produtoNome = db.estoque[productIndex].nome;
    }
  }

  const quantValue = Number(novaVenda.quantidade || 1);
  const totalValue = Number(novaVenda.total || 0);

  // 1. Relational operations on Supabase if configured
  if (supabase && status.connected && status.tablesFound) {
    try {
      // Fetch product quantity left
      if (produtoId) {
        const { data: prodData } = await supabase
          .from('estoque')
          .select('nome, quantidade')
          .eq('id', produtoId)
          .single();
        
        if (prodData) {
          produtoNome = prodData.nome;
          const novaQtd = Math.max(0, prodData.quantidade - quantValue);
          // Decrement inventory
          await supabase.from('estoque').update({ quantidade: novaQtd }).eq('id', produtoId);
        }
      }

      const vendaFormatada = {
        produto_id: produtoId,
        produto_nome: produtoNome,
        quantidade: quantValue,
        total: totalValue,
        comprador: novaVenda.comprador || "Visitante",
        data_venda: dataVendaValue
      };

      const { data, error } = await supabase
        .from('vendas')
        .insert([vendaFormatada])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err: any) {
      console.error("Erro ao registrar venda no Supabase, processando localmente:", err.message);
    }
  }

  // Local fallback processing
  if (produtoId && productIndex !== -1) {
    // Decrease stock amount
    db.estoque[productIndex].quantidade = Math.max(0, db.estoque[productIndex].quantidade - quantValue);
  }

  const vendaParaSalvar = {
    id: idValue,
    produto_id: produtoId,
    produto_nome: produtoNome,
    quantidade: quantValue,
    total: totalValue,
    comprador: novaVenda.comprador || "Visitante",
    data_venda: dataVendaValue
  };

  db.vendas.unshift(vendaParaSalvar); // Prepend to sales list
  saveLocalDB(db);
  res.status(201).json(vendaParaSalvar);
});

// GET Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
  const status = await checkSupabaseStatus();
  let alunos: any[] = [];
  let estoque: any[] = [];
  let vendas: any[] = [];

  if (supabase && status.connected && status.tablesFound) {
    try {
      const { data: listAlunos } = await supabase.from('alunos').select('*');
      const { data: listEstoque } = await supabase.from('estoque').select('*');
      const { data: listVendas } = await supabase.from('vendas').select('*');

      if (listAlunos) alunos = listAlunos;
      if (listEstoque) estoque = listEstoque;
      if (listVendas) vendas = listVendas;
    } catch (err: any) {
      console.error("Erro ao puxar dados agregados no Supabase, usando locais:", err.message);
      const db = getLocalDB();
      alunos = db.alunos;
      estoque = db.estoque;
      vendas = db.vendas;
    }
  } else {
    const db = getLocalDB();
    alunos = db.alunos;
    estoque = db.estoque;
    vendas = db.vendas;
  }

  // Calculate stats
  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter((a: any) => a.status === 'Ativo').length;
  const alunosInativos = totalAlunos - alunosAtivos;

  const totalVendas = vendas.length;
  const faturamentoTotal = vendas.reduce((acc: number, v: any) => acc + Number(v.total), 0);

  // Sum total value of items in stock (quantity * price)
  const valorEstoque = estoque.reduce((acc: number, p: any) => acc + (Number(p.quantidade) * Number(p.preco)), 0);

  // Stock low count
  const alertasEstoqueBaixo = estoque.filter((p: any) => Number(p.quantidade) <= Number(p.estoque_minimo)).length;

  // Best selling products counting
  const prodSalesDict: { [key: string]: number } = {};
  vendas.forEach((v: any) => {
    prodSalesDict[v.produto_nome] = (prodSalesDict[v.produto_nome] || 0) + Number(v.quantidade);
  });
  const produtosDestaque = Object.keys(prodSalesDict)
    .map(nome => ({ nome, quantidade: prodSalesDict[nome] }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  // Sales by Category
  const catSalesDict: { [key: string]: number } = {};
  vendas.forEach((v: any) => {
    const matchedProduct = estoque.find((p: any) => p.id === v.produto_id || p.nome === v.produto_nome);
    const category = matchedProduct ? matchedProduct.categoria : "Outros";
    catSalesDict[category] = (catSalesDict[category] || 0) + Number(v.total);
  });
  const categoriaVendas = Object.keys(catSalesDict).map(catName => ({
    name: catName,
    value: Math.round(catSalesDict[catName] * 100) / 100
  }));

  // Aggregated Sales by Month
  const monthlySalesDict: { [key: string]: number } = {};
  vendas.forEach((v: any) => {
    try {
      const date = new Date(v.data_venda);
      const label = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      monthlySalesDict[label] = (monthlySalesDict[label] || 0) + Number(v.total);
    } catch {
      // Safe fallback
      monthlySalesDict['Geral'] = (monthlySalesDict['Geral'] || 0) + Number(v.total);
    }
  });

  const faturamentoMensal = Object.keys(monthlySalesDict)
    .map(mes => ({ mes, valor: Math.round(monthlySalesDict[mes] * 100) / 100 }))
    .reverse()
    .slice(0, 6);

  // Recents lists
  const vendasRecentes = [...vendas]
    .sort((a: any, b: any) => new Date(b.data_venda).getTime() - new Date(a.data_venda).getTime())
    .slice(0, 5);

  const alunosRecentes = [...alunos]
    .sort((a: any, b: any) => new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime())
    .slice(0, 5);

  res.json({
    totalAlunos,
    alunosAtivos,
    alunosInativos,
    totalVendas,
    faturamentoTotal: Math.round(faturamentoTotal * 100) / 100,
    valorEstoque: Math.round(valorEstoque * 100) / 100,
    produtosDestaque,
    alertasEstoqueBaixo,
    vendasRecentes,
    alunosRecentes,
    categoriaVendas,
    faturamentoMensal
  });
});

// Setup Vite Dev server or Serve Static production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
