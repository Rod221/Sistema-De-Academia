export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  plano: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  status: 'Ativo' | 'Inativo';
  data_cadastro: string;
  data_vencimento: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  preco: number;
  preco_custo: number;
  estoque_minimo: number;
  fornecedor: string;
}

export interface Venda {
  id: string;
  produto_id: string | null;
  produto_nome: string;
  quantidade: number;
  total: number;
  comprador: string;
  data_venda: string;
}

export interface DashboardStats {
  totalAlunos: number;
  alunosAtivos: number;
  alunosInativos: number;
  totalVendas: number;
  faturamentoTotal: number;
  valorEstoque: number;
  produtosDestaque: { nome: string; quantidade: number }[];
  alertasEstoqueBaixo: number;
  vendasRecentes: Venda[];
  alunosRecentes: Aluno[];
  categoriaVendas: { name: string; value: number }[];
  faturamentoMensal: { mes: string; valor: number }[];
}
