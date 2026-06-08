import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  UserPlus, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Aluno, Venda, DashboardStats } from '../types';

interface DashboardTabProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: 'alunos' | 'estoque' | 'vendas') => void;
}

export default function DashboardTab({ stats, onNavigateTab }: DashboardTabProps) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent animate-spin rounded-none"></div>
        <p className="mt-4 text-zinc-400 font-mono text-xs uppercase tracking-wider">Lendo banco de dados estatístico...</p>
      </div>
    );
  }

  // Helper inside component for monetary formatting
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const activePercent = stats.totalAlunos ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100) : 0;
  const maxMonthlyRevenue = stats.faturamentoMensal.length 
    ? Math.max(...stats.faturamentoMensal.map(m => m.valor), 1000) 
    : 1000;

  return (
    <div className="space-y-8" id="dashboard-tab">
      
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Alunos */}
        <div 
          onClick={() => onNavigateTab('alunos')}
          className="bg-zinc-900 p-6 rounded-none border-l-4 border-lime-400 border-y border-r border-zinc-800 transition-all duration-200 cursor-pointer group hover:bg-zinc-850"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-lime-400 tracking-wider uppercase font-mono">Alunos Cadastrados</span>
            <div className="p-2 bg-zinc-800 text-lime-400 border border-zinc-700 rounded-none group-hover:bg-lime-400 group-hover:text-black transition-colors duration-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-4xl font-black text-white tracking-tight italic font-mono" id="total-alunos-count">
              {stats.totalAlunos}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-mono uppercase tracking-wider">
              <span className="font-extrabold text-lime-400 bg-lime-950/50 border border-lime-800/40 px-2 py-0.5">
                {stats.alunosAtivos} ATIVOS
              </span>
              <span className="text-zinc-500 font-medium">
                {stats.alunosInativos} INATIVOS
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Faturamento */}
        <div 
          onClick={() => onNavigateTab('vendas')}
          className="bg-zinc-900 p-6 rounded-none border-l-4 border-lime-400 border-y border-r border-zinc-800 transition-all duration-200 cursor-pointer group hover:bg-zinc-850"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-lime-400 tracking-wider uppercase font-mono">Receita de Vendas</span>
            <div className="p-2 bg-zinc-800 text-lime-400 border border-zinc-700 rounded-none group-hover:bg-lime-400 group-hover:text-black transition-colors duration-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-4xl font-black text-white tracking-tight italic font-mono">
              {formatBRL(stats.faturamentoTotal)}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-mono uppercase tracking-wider">
              <span className="font-extrabold text-zinc-300 bg-zinc-800 px-2 py-0.5">
                {stats.totalVendas} VENDAS
              </span>
              <span className="text-zinc-500 font-medium">ACUMULADO GERAL</span>
            </div>
          </div>
        </div>

        {/* Card 3: Valor Estoque */}
        <div 
          onClick={() => onNavigateTab('estoque')}
          className="bg-zinc-900 p-6 rounded-none border-l-4 border-lime-400 border-y border-r border-zinc-800 transition-all duration-200 cursor-pointer group hover:bg-zinc-850"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-lime-400 tracking-wider uppercase font-mono">Valor de Estoque</span>
            <div className="p-2 bg-zinc-800 text-lime-400 border border-zinc-700 rounded-none group-hover:bg-lime-400 group-hover:text-black transition-colors duration-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-4xl font-black text-white tracking-tight italic font-mono">
              {formatBRL(stats.valorEstoque)}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-mono uppercase tracking-wider">
              <span className="text-lime-400 bg-lime-950/40 px-2 py-0.5 font-extrabold border border-lime-800/40">
                PREÇO DE VENDA
              </span>
              <span className="text-zinc-500 font-medium">TOTALIZADO</span>
            </div>
          </div>
        </div>

        {/* Card 4: Alertas Estoque Baixo */}
        <div 
          onClick={() => onNavigateTab('estoque')}
          className="bg-zinc-900 p-6 rounded-none border-l-4 border-lime-400 border-y border-r border-zinc-800 transition-all duration-200 cursor-pointer group hover:bg-zinc-850"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-lime-400 tracking-wider uppercase font-mono">Alertas de Estoque</span>
            <div className={`p-2 border rounded-none transition-colors duration-200 ${
              stats.alertasEstoqueBaixo > 0 
                ? 'bg-red-950/70 text-red-400 border-red-800/50 group-hover:bg-red-500 group-hover:text-black' 
                : 'bg-zinc-800 text-zinc-550 border-zinc-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`font-display text-4xl font-black tracking-tight italic font-mono ${
              stats.alertasEstoqueBaixo > 0 ? 'text-red-500' : 'text-white'
            }`}>
              {stats.alertasEstoqueBaixo}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-mono uppercase tracking-wider">
              {stats.alertasEstoqueBaixo > 0 ? (
                <span className="font-extrabold text-red-400 bg-red-950/40 px-2 py-0.5 border border-red-800/40 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" /> REABASTECER URGENTE
                </span>
              ) : (
                <span className="font-extrabold text-lime-400 bg-lime-950/40 px-2 py-0.5 border border-lime-800/40">
                  NÍVEIS SEGUROS
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 2. Visual Graphs and Stats Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph: Faturamento Mensal */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-none p-6 border-2 border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-black text-white uppercase text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lime-400" />
                Desempenho Comercial
              </h4>
              <span className="text-xs font-mono font-bold text-zinc-500 tracking-wider uppercase">FATURAMENTO MENSAL</span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Fluxo histórico de faturamento derivado das ordens fechadas de compra</p>
          </div>

          {/* Render custom reactive bar chart using pure HTML & SVGs for absolute safety */}
          <div className="mt-8 flex items-end justify-between gap-3 h-48 px-2 border-b border-zinc-800 pb-2">
            {stats.faturamentoMensal.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                Nenhuma venda registrada até o momento para o histórico
              </div>
            ) : (
              stats.faturamentoMensal.map((item, idx) => {
                const heightPercent = Math.max(10, Math.round((item.valor / maxMonthlyRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black font-mono font-black text-[10px] px-2 py-1 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(163,230,53,1)] absolute -translate-y-12 whitespace-nowrap pointer-events-none z-10">
                      {formatBRL(item.valor)}
                    </div>
                    {/* Actual Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full max-w-[40px] bg-lime-400 hover:bg-white transition-all duration-350 relative cursor-pointer border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] rounded-none"
                    >
                      <div className="absolute inset-x-0 top-0 h-1/3 bg-black/15"></div>
                    </div>
                    {/* Label/Month */}
                    <span className="text-[10px] font-black text-zinc-400 font-mono tracking-wider uppercase">
                      {item.mes}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status circle and percentage ratios */}
        <div className="bg-zinc-900 rounded-none p-6 border-2 border-zinc-800 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-white uppercase text-base mb-1">Status dos Alunos</h4>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-6">Distribuição atual das matrículas ativas</p>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Circle graphic */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#1f2937" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#a3e635" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - activePercent / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center leading-none">
                <span className="font-display font-black text-white text-3xl italic">{activePercent}%</span>
                <span className="text-[8px] font-bold text-lime-400 tracking-widest uppercase mt-1 font-mono">Ativos</span>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6 border-t border-zinc-800 pt-5 text-left">
              <div>
                <span className="inline-block w-2.5 h-2.5 bg-lime-400 rounded-none mr-2"></span>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Ativos</span>
                <div className="text-2xl font-black text-white font-display italic pl-4.5">{stats.alunosAtivos}</div>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="inline-block w-2.5 h-2.5 bg-zinc-700 rounded-none mr-2"></span>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Inativos</span>
                <div className="text-2xl font-black text-white font-display italic pl-4.5">{stats.alunosInativos}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Operational Grid: Recent Alunos and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Col 1: Alunos Recentes */}
        <div className="bg-zinc-900 rounded-none border-2 border-zinc-800 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <h4 className="font-display font-black text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-lime-400" />
              Alunos Recentes
            </h4>
            <button 
              onClick={() => onNavigateTab('alunos')}
              className="text-[10px] font-mono uppercase font-black text-lime-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-4">
            {stats.alunosRecentes.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono text-center py-6">NENHUM ALUNO CADASTRADO.</p>
            ) : (
              stats.alunosRecentes.map((aluno) => (
                <div key={aluno.id} className="flex items-center justify-between border-b border-zinc-850 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-black text-white truncate uppercase">{aluno.nome}</p>
                    <p className="text-[10px] font-bold text-zinc-500 font-mono mt-0.5">{aluno.plano.toUpperCase()} • {aluno.telefone}</p>
                  </div>
                  <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-none border ${
                    aluno.status === 'Ativo' 
                      ? 'bg-lime-950/40 text-lime-400 border-lime-800/40' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-750'
                  }`}>
                    {aluno.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2 & 3: Últimas Vendas */}
        <div className="bg-zinc-900 rounded-none border-2 border-zinc-800 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <h4 className="font-display font-black text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-lime-400" />
              Últimas Vendas Realizadas
            </h4>
            <button 
              onClick={() => onNavigateTab('vendas')}
              className="text-[10px] font-mono uppercase font-black text-lime-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
            >
              Nova Venda <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase font-mono">
                  <th className="pb-3 text-[9px] tracking-wider">Produto</th>
                  <th className="pb-3 text-[9px] tracking-wider">Cliente</th>
                  <th className="pb-3 text-[9px] tracking-wider">Data</th>
                  <th className="pb-3 text-[9px] tracking-wider text-right">Qtd</th>
                  <th className="pb-3 text-[9px] tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {stats.vendasRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500 font-mono uppercase">NENHUMA VENDA REALIZADA.</td>
                  </tr>
                ) : (
                  stats.vendasRecentes.map((venda) => (
                    <tr key={venda.id} className="text-zinc-300 hover:bg-zinc-850/50 transition">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-white uppercase block max-w-[180px]">{venda.produto_nome}</span>
                      </td>
                      <td className="py-3 text-zinc-400 font-medium uppercase font-mono">{venda.comprador}</td>
                      <td className="py-3 text-zinc-500 font-mono text-[10px]">{formatDate(venda.data_venda)}</td>
                      <td className="py-3 text-right font-black text-zinc-400 font-mono">{venda.quantidade}</td>
                      <td className="py-3 text-right font-black text-lime-400 font-mono">{formatBRL(venda.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
