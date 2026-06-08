import React, { useState } from 'react';
import { 
  Plus, 
  ShoppingBag, 
  User, 
  DollarSign, 
  Check, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Tag, 
  X,
  CreditCard,
  Printer,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Produto, Aluno, Venda } from '../types';

interface VendasTabProps {
  vendas: Venda[];
  estoque: Produto[];
  alunos: Aluno[];
  onAddVenda: (venda: Omit<Venda, 'id' | 'data_venda' | 'produto_nome'>) => Promise<boolean>;
}

export default function VendasTab({ vendas, estoque, alunos, onAddVenda }: VendasTabProps) {
  // POS Form States
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [compradorNome, setCompradorNome] = useState('');
  const [useRegisteredAluno, setUseRegisteredAluno] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState('');
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<Venda | null>(null);

  // Active receipt viewer modal
  const [activeReceipt, setActiveReceipt] = useState<Venda | null>(null);
  const [printedNotice, setPrintedNotice] = useState(false);

  // Compute selected product details
  const selectedProduct = estoque.find(p => p.id === selectedProdutoId);
  const isOutOfStock = selectedProduct ? selectedProduct.quantidade === 0 : false;
  const insulficientStock = selectedProduct ? quantidade > selectedProduct.quantidade : false;

  const handleProductSelect = (id: string) => {
    setSelectedProdutoId(id);
    const prod = estoque.find(p => p.id === id);
    if (prod) {
      // Keep quantity clamped within boundaries
      if (prod.quantidade > 0) {
        setQuantidade(1);
      } else {
        setQuantidade(0);
      }
    }
  };

  const handleAlunoChange = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    const aluno = alunos.find(a => a.id === alunoId);
    if (aluno) {
      setCompradorNome(aluno.nome);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.preco * quantidade;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessReceipt(null);

    if (!selectedProdutoId) {
      setFormError('Selecione um produto do estoque.');
      return;
    }
    if (quantidade <= 0) {
      setFormError('A quantidade de itens vendidos deve ser pelo menos 1.');
      return;
    }
    if (!selectedProduct) {
      setFormError('O produto selecionado é inválido.');
      return;
    }
    if (quantidade > selectedProduct.quantidade) {
      setFormError(`Quantidade insuficiente no estoque. Apenas ${selectedProduct.quantidade} unidades adicionadas e disponíveis.`);
      return;
    }

    const finalComprador = compradorNome.trim() || "Visitante";

    setIsSubmitting(true);
    try {
      const vendaDados = {
        produto_id: selectedProdutoId,
        quantidade: quantidade,
        total: calculateTotal(),
        comprador: finalComprador
      };

      const { data, error } = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendaDados)
      }).then(res => {
        if (!res.ok) throw new Error();
        return res.json().then(data => ({ data, error: null }));
      }).catch(err => ({ data: null, error: 'Erro de processamento' }));

      if (data) {
        // Flash receipt success
        setSuccessReceipt(data);
        setPrintedNotice(false);
        setActiveReceipt(data); // Open invoice
        
        // Reset states
        setSelectedProdutoId('');
        setQuantidade(1);
        setCompradorNome('');
        setSelectedAlunoId('');
        setUseRegisteredAluno(false);
      } else {
        setFormError('Não foi possível gravar a transação. Verifique conexões.');
      }
    } catch (err) {
      setFormError('Falha ao comunicar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDateBR = (val: string) => {
    try {
      const date = new Date(val);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return val;
    }
  };

  const simulatePrinting = () => {
    setPrintedNotice(true);
    setTimeout(() => {
      setPrintedNotice(false);
    }, 4500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="vendas-tab">
      
      {/* 1. Point of Sale checkout side */}
      <div className="lg:col-span-1 bg-zinc-900 border-2 border-zinc-800 rounded-none p-6 h-fit text-white">
        <h3 className="font-display font-black text-lime-400 uppercase text-xs tracking-wider mb-5 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-lime-400" />
          REGISTRAR VENDA (POS DECK)
        </h3>

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          
          {formError && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/40 rounded-none text-red-500 text-[11px] font-mono tracking-wide uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Escolher Produto *</label>
            <select
              value={selectedProdutoId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none uppercase font-mono font-bold"
            >
              <option value="">-- SELECIONE ITEM DO DECK --</option>
              {estoque.map((item) => (
                <option 
                  key={item.id} 
                  value={item.id}
                  disabled={item.quantidade === 0}
                  className="bg-zinc-900"
                >
                  {item.nome.toUpperCase()} ({item.quantidade} UN.) — {formatBRL(item.preco)}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div className="text-[10px] text-zinc-400 mt-2 font-mono uppercase bg-zinc-950 p-2 border border-zinc-850 rounded-none leading-relaxed">
                <div>CATEGORIA: <span className="text-white font-black">{selectedProduct.categoria.toUpperCase()}</span></div> 
                <div className="mt-0.5">PREÇO DECK: <span className="text-lime-400 font-extrabold">{formatBRL(selectedProduct.preco)}</span></div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Quantidade de Itens</label>
            <div className="flex items-center gap-2 w-full">
              <input
                type="number"
                min="1"
                disabled={!selectedProdutoId || isOutOfStock}
                max={selectedProduct ? selectedProduct.quantidade : 100}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-bold uppercase"
              />
              <span className="text-xs text-zinc-500 font-mono uppercase shrink-0 font-extrabold">UNIDADES</span>
            </div>

            {insulficientStock && (
              <div className="text-[10px] text-red-500 font-black font-mono uppercase tracking-wide mt-2 flex items-center gap-1.5 p-2 bg-red-950/20 border border-red-800/40">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Estoque Insuficiente! Limite real: {selectedProduct?.quantidade} un.</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-zinc-800 my-4 pt-2"></div>

          {/* Comprador Identification Settings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Identificar Cliente</label>
              
              <button
                type="button"
                onClick={() => {
                  setUseRegisteredAluno(!useRegisteredAluno);
                  setCompradorNome('');
                  setSelectedAlunoId('');
                }}
                className="text-[10px] text-lime-400 hover:text-white font-bold underline font-mono uppercase cursor-pointer"
              >
                {useRegisteredAluno ? 'Nome Avulso' : 'Listar Matriculados'}
              </button>
            </div>

            {useRegisteredAluno ? (
              <select
                value={selectedAlunoId}
                onChange={(e) => handleAlunoChange(e.target.value)}
                className="w-full bg-zinc-800 border-none p-3 text-xs focus:ring-2 focus:ring-lime-400 text-white rounded-none font-black font-mono uppercase"
              >
                <option value="">-- VINCULAR ALUNO ACADEMIA --</option>
                {alunos.map((item) => (
                  <option key={item.id} value={item.id} className="bg-zinc-900">
                    {item.nome.toUpperCase()} ({item.status === 'Ativo' ? 'ATIVO' : 'INATIVO'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="NOME DO COMPRADOR / DEIXE EM BRANCO P/ VISITANTE"
                  value={compradorNome}
                  onChange={(e) => setCompradorNome(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-zinc-800 border-none text-white rounded-none text-xs font-medium placeholder-zinc-500 focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
                />
              </div>
            )}
          </div>

          {/* Pricing Total Summary Box */}
          <div className="p-4 bg-zinc-950 rounded-none border border-zinc-800 flex items-center justify-between mt-5">
            <div>
              <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block font-mono">Valor Total a Fagar</span>
              <span className="text-xl font-black text-lime-400 font-mono tracking-tight italic">{formatBRL(calculateTotal())}</span>
            </div>
            <div className="text-[10px] font-mono font-black text-black bg-lime-400 px-2.5 py-1 rounded-none flex items-center gap-1 uppercase select-none">
              <CreditCard className="w-3.5 h-3.5 text-black" />
              DINHEIRO/PIX
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedProdutoId || isOutOfStock || insulficientStock}
            className="w-full py-4 bg-lime-400 hover:bg-white text-black font-black rounded-none border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition duration-150 disabled:bg-zinc-800 disabled:text-zinc-500 font-mono text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 uppercase"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Processando Checkout...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar e Registrar Venda</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. Registered List of Sales and Receipt History */}
      <div className="lg:col-span-2 bg-zinc-900 border-2 border-zinc-800 rounded-none p-6 h-fit text-white">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-black text-white uppercase text-sm flex items-center gap-2 tracking-tight">
            <FileText className="w-5 h-5 text-lime-400" />
            HISTÓRICO E PRONTUÁRIOS DE VENDAS
          </h3>
          <span className="text-[10px] font-extrabold font-mono text-zinc-500 uppercase bg-zinc-950 px-2.5 py-1 border border-zinc-800 rounded-none">
            {vendas.length} TRANSAÇÕES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-800 text-zinc-500 font-mono uppercase text-[10px] pb-3">
                <th className="pb-3 text-left">Item / Horário</th>
                <th className="pb-3 text-left">Comprador</th>
                <th className="pb-3 text-right">Qtd</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono uppercase text-xs">NENHUMA VENDA FATURADA NO HISTÓRICO ATÉ O MOMENTO CADASTRO.</td>
                </tr>
              ) : (
                vendas.map((item) => (
                  <tr key={item.id} className="text-zinc-300 hover:bg-zinc-950/40 transition duration-150">
                    <td className="py-3.5 pr-2 min-w-[170px]">
                      <div className="font-bold text-white uppercase tracking-tight truncate block max-w-[180px]">{item.produto_nome.toUpperCase()}</div>
                      <div className="text-[9px] text-zinc-500 font-semibold font-mono mt-0.5 uppercase">{formatDateBR(item.data_venda)}</div>
                    </td>
                    <td className="py-3.5 font-bold text-zinc-450 uppercase font-mono">{item.comprador.toUpperCase()}</td>
                    <td className="py-3.5 text-right font-black text-white font-mono">{item.quantidade}</td>
                    <td className="py-3.5 text-right font-black text-lime-400 font-mono">{formatBRL(item.total)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setPrintedNotice(false);
                          setActiveReceipt(item);
                        }}
                        className="px-2.5 py-1.5 text-[9px] font-black font-mono border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-lime-400 hover:text-white rounded-none transition cursor-pointer flex items-center gap-1 uppercase ml-auto"
                      >
                        <Printer className="w-3 h-3" />
                        Ver Cupom
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Printable Visual Receipt Overlay Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 rounded-none w-full max-w-sm border-2 border-lime-400 shadow-2xl overflow-hidden animate-slide-up text-white p-2">
            
            {/* Ticket receipt container */}
            <div className="bg-zinc-900 p-6 rounded-none border-2 border-dashed border-zinc-800 relative">
              {/* Left hole */}
              <div className="absolute left-0 top-1/2 -translate-x-3 w-6 h-6 bg-zinc-950 rounded-full border-r-2 border-zinc-800 z-10"></div>
              {/* Right hole */}
              <div className="absolute right-0 top-1/2 translate-x-3 w-6 h-6 bg-zinc-950 rounded-full border-l-2 border-zinc-800 z-10"></div>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setActiveReceipt(null);
                  setPrintedNotice(false);
                }}
                className="absolute right-3 top-3 p-1.5 rounded-none text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Header Invoice details */}
              <div className="text-center pb-5 border-b-2 border-zinc-800">
                <div className="inline-flex p-2 bg-lime-950/40 text-lime-400 rounded-none mb-2 border border-lime-800/40">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-display font-black text-white text-xs tracking-wider uppercase">CUPOM FISCAL SIMPLIFICADO</h4>
                <p className="text-[9px] font-bold text-lime-400 uppercase tracking-widest mt-0.5 font-mono">SISTEMA ACADEMIA BRUTALIST</p>
              </div>

              {/* Invoice lines */}
              <div className="py-5 space-y-3 border-b-2 border-dashed border-zinc-800 text-[10px] font-mono uppercase text-zinc-350">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cupom Nro:</span>
                  <span className="font-mono text-white font-black">{activeReceipt.id.replace('venda_', '#V').substring(0, 10).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data Operação:</span>
                  <span className="font-mono text-white font-black">{formatDateBR(activeReceipt.data_venda)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cliente Matrícula:</span>
                  <span className="text-lime-400 font-extrabold max-w-[150px] truncate block text-right">{activeReceipt.comprador.toUpperCase()}</span>
                </div>
                
                <div className="border-t border-zinc-850 pt-3">
                  <p className="font-black text-white mb-1">{activeReceipt.produto_nome.toUpperCase()}</p>
                  <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                    <span>{activeReceipt.quantidade} un. x {formatBRL(activeReceipt.total / activeReceipt.quantidade)}</span>
                    <span className="text-lime-400 text-xs font-black">{formatBRL(activeReceipt.total)}</span>
                  </div>
                </div>
              </div>

              {/* Total checkout line */}
              <div className="py-4 flex justify-between items-center text-white font-bold text-xs uppercase">
                <span className="tracking-wide">VALOR TOTAL</span>
                <span className="text-base font-black font-mono text-black bg-lime-400 px-3 py-1 rounded-none select-none">
                  {formatBRL(activeReceipt.total)}
                </span>
              </div>

              {/* Mock Barcode graphics */}
              <div className="pt-3 text-center">
                <div className="h-9 w-full bg-black flex gap-[2px] px-2 items-center justify-center rounded-none overflow-hidden mb-1 opacity-90 select-none">
                  {Array.from({ length: 42 }).map((_, i) => {
                    const barWidth = (i % 3 === 0) ? 'w-[4px]' : (i % 5 === 0) ? 'w-[1px]' : 'w-[2px]';
                    const barColor = (i % 7 === 1) ? 'bg-transparent' : 'bg-zinc-400';
                    return <div key={i} className={`h-8 ${barWidth} ${barColor}`}></div>;
                  })}
                </div>
                <span className="text-[9px] text-zinc-650 font-mono font-bold uppercase tracking-wider select-text">{activeReceipt.id.toUpperCase()}</span>
              </div>

              {/* Non-blocking Printing Simulator HUD */}
              {printedNotice && (
                <div className="mt-4 p-2 bg-lime-950/60 border border-lime-800 text-lime-400 text-center font-mono uppercase rounded-none text-[10px] font-black tracking-wider animate-pulse flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-ping"></div>
                  <span>ENVIADO À FILA DE IMPRESSÃO DA RECEPÇÃO!</span>
                </div>
              )}

              {/* Print Receipt trigger notification */}
              <button 
                type="button"
                onClick={simulatePrinting}
                className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-black text-xs rounded-none transition duration-150 cursor-pointer flex items-center justify-center gap-2 border border-zinc-700 uppercase font-mono"
              >
                <Printer className="w-4 h-4 text-lime-400" />
                Imprimir Recibo Térmico
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
