import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  X, 
  RefreshCcw, 
  Minus, 
  Truck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Produto } from '../types';

interface EstoqueTabProps {
  estoque: Produto[];
  onAddProduto: (produto: Omit<Produto, 'id'>) => Promise<boolean>;
  onEditProduto: (id: string, produto: Partial<Produto>) => Promise<boolean>;
  onDeleteProduto: (id: string) => Promise<boolean>;
}

export default function EstoqueTab({ estoque, onAddProduto, onEditProduto, onDeleteProduto }: EstoqueTabProps) {
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterAlert, setFilterAlert] = useState(false);

  // Modal controller
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Form states
  const [formNome, setFormNome] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formQuantidade, setFormQuantidade] = useState(0);
  const [formPreco, setFormPreco] = useState(0);
  const [formPrecoCusto, setFormPrecoCusto] = useState(0);
  const [formEstoqueMinimo, setFormEstoqueMinimo] = useState(5);
  const [formFornecedor, setFormFornecedor] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submit
  const handleOpenAddModal = () => {
    setEditingProduto(null);
    setFormNome('');
    setFormCategoria('Suplementos');
    setFormQuantidade(10);
    setFormPreco(100);
    setFormPrecoCusto(60);
    setFormEstoqueMinimo(5);
    setFormFornecedor('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (produto: Produto) => {
    setEditingProduto(produto);
    setFormNome(produto.nome);
    setFormCategoria(produto.categoria);
    setFormQuantidade(produto.quantidade);
    setFormPreco(produto.preco);
    setFormPrecoCusto(produto.preco_custo);
    setFormEstoqueMinimo(produto.estoque_minimo);
    setFormFornecedor(produto.fornecedor || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    if (formPreco <= 0) {
      setFormError('O preço de venda deve ser maior que zero.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const prodDados = {
        nome: formNome.trim(),
        categoria: formCategoria,
        quantidade: Number(formQuantidade),
        preco: Number(formPreco),
        preco_custo: Number(formPrecoCusto),
        estoque_minimo: Number(formEstoqueMinimo),
        fornecedor: formFornecedor.trim()
      };

      let success = false;
      if (editingProduto) {
        success = await onEditProduto(editingProduto.id, prodDados);
      } else {
        success = await onAddProduto(prodDados);
      }

      if (success) {
        setShowFormModal(false);
      } else {
        setFormError('Erro ao gravar dados no servidor de banco de dados.');
      }
    } catch (err) {
      setFormError('Falha crítica de comunicação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper and modifiers
  const handleQuickQuantityMod = async (produto: Produto, dQuantity: number) => {
    const novaQtd = Math.max(0, produto.quantidade + dQuantity);
    await onEditProduto(produto.id, { quantidade: novaQtd });
  };

  const handleDeleteClick = async (produto: Produto) => {
    if (confirm(`Tem certeza que deseja apagar o produto "${produto.nome}" do estoque?`)) {
      await onDeleteProduto(produto.id);
    }
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Extract unique categories for filter list
  const categoriasExistentes = Array.from(new Set(estoque.map(p => p.categoria || 'Acessórios')));

  // Filter products list
  const filteredEstoque = estoque.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategoria === '' || p.categoria === filterCategoria;
    const isLow = p.quantidade <= p.estoque_minimo;
    const matchesAlert = !filterAlert || isLow;

    return matchesSearch && matchesCategory && matchesAlert;
  });

  return (
    <div className="space-y-6" id="estoque-tab">
      
      {/* Search and Filters Header */}
      <div className="bg-zinc-900 p-5 rounded-none border-2 border-zinc-800">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Live search */}
            <div className="relative col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="BUSCAR PRODUTOS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-xs bg-zinc-800 border-none text-white rounded-none focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-3 py-3 text-xs bg-zinc-800 border-none text-white rounded-none focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
              >
                <option value="">TODAS CATEGORIAS</option>
                {categoriasExistentes.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Alert Filter Switch */}
            <button
              onClick={() => setFilterAlert(!filterAlert)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none text-xs font-bold border transition cursor-pointer font-mono uppercase ${
                filterAlert 
                  ? 'bg-amber-950/40 text-amber-500 border-amber-850/50' 
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${filterAlert ? 'text-amber-500' : 'text-zinc-500'}`} />
              <span>Estoques Baixos</span>
            </button>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-3 shrink-0">
            {(search || filterCategoria || filterAlert) && (
              <button
                onClick={() => { setSearch(''); setFilterCategoria(''); setFilterAlert(false); }}
                className="flex items-center gap-1 px-4 py-3 text-xs font-bold font-mono bg-zinc-800 text-lime-400 hover:text-white rounded-none transition cursor-pointer border border-zinc-700 uppercase"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> LIMPAR
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 text-xs font-black text-black bg-lime-400 hover:bg-white rounded-none transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase"
              id="btn-adicionar-produto"
            >
              <Plus className="w-4 h-4" /> NOVO PRODUTO
            </button>
          </div>

        </div>
      </div>

      {/* Grid of Products inside Cards for bento layout design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEstoque.length === 0 ? (
          <div className="col-span-full bg-zinc-900 rounded-none p-12 text-center text-zinc-500 border-2 border-zinc-800">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="font-bold text-zinc-400 uppercase font-mono text-xs">NENHUM PRODUTO CADASTRADO NO ESTOQUE.</p>
            <p className="text-[10px] text-zinc-550 uppercase font-mono mt-1 leading-relaxed">CRIE MERCADORIAS DE SUPLEMENTAÇÃO OU ACESSÓRIOS ESPORTIVOS PARA ADICIONAR AO SEU PAINEL.</p>
          </div>
        ) : (
          filteredEstoque.map((prod) => {
            const isLow = prod.quantidade <= prod.estoque_minimo;
            const isOutOfStock = prod.quantidade === 0;

            let stockColorClass = "bg-lime-950/40 text-lime-400 border-lime-800/40";
            if (isOutOfStock) stockColorClass = "bg-red-950/40 text-red-400 border-red-800/40 animate-pulse";
            else if (isLow) stockColorClass = "bg-amber-950/40 text-amber-500 border-amber-805/40";

            return (
              <div 
                key={prod.id} 
                className={`bg-zinc-900 rounded-none border-2 p-5 flex flex-col justify-between transition-all duration-150 relative ${
                  isOutOfStock ? 'border-red-800' : isLow ? 'border-amber-800' : 'border-zinc-800'
                }`}
              >
                {/* Category tags */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded-none">
                    {prod.categoria.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 text-zinc-400 hover:text-lime-400 rounded-none hover:bg-zinc-800 transition cursor-pointer border border-zinc-800"
                      title="Editar do Produto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(prod)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-none hover:bg-zinc-800 transition cursor-pointer border border-zinc-800"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Head details */}
                <div className="mb-4">
                  <h4 className="font-display font-black text-white text-sm uppercase leading-snug truncate-2-lines h-10 tracking-tight">
                    {prod.nome}
                  </h4>
                  
                  {prod.fornecedor && (
                    <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-2 font-mono uppercase">
                      <Truck className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                      FORNECEDOR: {prod.fornecedor}
                    </p>
                  )}
                </div>

                {/* Financial values overview */}
                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 py-3 mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Preço de Venda</span>
                    <span className="text-base font-black text-lime-400 font-mono italic">{formatBRL(prod.preco)}</span>
                  </div>
                  <div className="border-l border-zinc-850 pl-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Custo Unitário</span>
                    <span className="text-sm font-bold text-zinc-450 font-mono">{formatBRL(prod.preco_custo)}</span>
                  </div>
                </div>

                {/* Counter adjusting segment */}
                <div className="flex items-center justify-between bg-zinc-950 p-2.5 border border-zinc-850 rounded-none">
                  {/* Stock tag status badge */}
                  <div className={`px-2 py-1 rounded-none border font-mono font-black text-[9px] uppercase tracking-wider ${stockColorClass}`}>
                    {isOutOfStock ? 'Sem estoque' : isLow ? 'Baixo Estoque' : 'Seguro'}
                  </div>

                  {/* Inline quick quantity change controls */}
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-none p-0.5">
                    <button 
                      onClick={() => handleQuickQuantityMod(prod, -1)}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition cursor-pointer disabled:opacity-50"
                      disabled={prod.quantidade === 0}
                      title="Diminuir Estoque (-1)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black font-mono text-white min-w-[20px] text-center">
                      {prod.quantidade}
                    </span>
                    <button 
                      onClick={() => handleQuickQuantityMod(prod, 1)}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition cursor-pointer"
                      title="Aumentar Estoque (+1)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleQuickQuantityMod(prod, 5)}
                      className="px-2 py-0.5 text-[9px] font-black bg-lime-400 text-black hover:bg-white rounded-none transition cursor-pointer"
                      title="Reposição Rápida (+5)"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Sub status details footer */}
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase mt-2.5 pt-1.5 border-t border-zinc-850">
                  <span>Mínimo seguro: <strong className="text-zinc-300">{prod.estoque_minimo} un.</strong></span>
                  <span>Margem: <strong className="text-lime-400 font-bold">+{Math.round(((prod.preco - prod.preco_custo) / prod.preco_custo) * 105 || 0)}%</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Form Modal Dialog */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 text-white rounded-none w-full max-w-lg border-2 border-lime-400 shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="p-6 border-b-2 border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="font-display font-black text-lime-400 uppercase text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-lime-400" />
                {editingProduto ? 'EDITAR DADOS DA MERCADORIA' : 'CADASTRAR CORPO MERCADO'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                
                {formError && (
                  <div className="p-3.5 bg-red-950/40 border border-red-800/40 text-red-500 text-[11px] rounded-none font-mono tracking-wide uppercase flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Nome Comercial do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Whey Protein Pro 900g Morango"
                    className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-medium placeholder-zinc-500 uppercase"
                  />
                </div>

                {/* Category and Fornecedor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Categoria</label>
                    <select
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value)}
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-black font-mono uppercase"
                    >
                      <option value="Suplementos">Suplementos Alimentares</option>
                      <option value="Acessórios">Equipamentos & Acessórios</option>
                      <option value="Vestuário">Vestuários / Roupas</option>
                      <option value="Bebidas">Bebidas e Isotônicos</option>
                      <option value="Outros">Outras categorias</option>
                    </select>
                  </div>

                  {/* Supplier text */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Distribuidor / Fornecedor</label>
                    <input
                      type="text"
                      value={formFornecedor}
                      onChange={(e) => setFormFornecedor(e.target.value)}
                      placeholder="Ex: Nutri Distribuidora"
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-medium placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Financial configurations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preço de Custo */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Preço de Custo (R$)</label>
                      <span className="text-[9px] font-bold font-mono text-black bg-lime-400 px-1 py-0.5 rounded-none uppercase">ROI REF</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formPrecoCusto}
                      onChange={(e) => setFormPrecoCusto(Number(e.target.value))}
                      className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-bold"
                    />
                  </div>

                  {/* Preço de Venda */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5 font-mono">Preço de Venda Praticado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formPreco}
                      onChange={(e) => setFormPreco(Number(e.target.value))}
                      className="w-full bg-lime-950/20 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-lime-400 rounded-none font-mono font-black"
                    />
                  </div>
                </div>

                {/* Amounts and Alerts thresholds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Qtd em estoque */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Quantidade em Estoque</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantidade}
                      onChange={(e) => setFormQuantidade(Number(e.target.value))}
                      className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-bold"
                    />
                  </div>

                  {/* Min Warning threshold */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Limite Alerta Mínimo (Alerta)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formEstoqueMinimo}
                      onChange={(e) => setFormEstoqueMinimo(Number(e.target.value))}
                      className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-bold text-amber-500 bg-amber-955/20"
                    />
                  </div>
                </div>

              </div>

              <div className="p-6 border-t-2 border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-bold font-mono uppercase text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 text-xs font-black uppercase text-black bg-lime-400 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 rounded-none border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>PROCESSANDO...</span>
                    </>
                  ) : (
                    <span>{editingProduto ? 'GRAVAR ALTERAÇÕES' : 'ADICIONAR AO DEQUE'}</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
