import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  LayoutDashboard, 
  Database, 
  AlertTriangle, 
  LogOut,
  Dumbbell,
  Clock,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { Aluno, Produto, Venda, DashboardStats } from './types';
import DashboardTab from './components/DashboardTab';
import AlunosTab from './components/AlunosTab';
import EstoqueTab from './components/EstoqueTab';
import VendasTab from './components/VendasTab';
import SupaConfigCard from './components/SupaConfigCard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alunos' | 'estoque' | 'vendas' | 'config'>('dashboard');
  
  // Data Cache States
  const [config, setConfig] = useState<any>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [estoque, setEstoque] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading States
  const [globalLoading, setGlobalLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Time stamp updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch configurations
  const loadAppConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Erro ao ler configurações:", err);
    }
  };

  // Aggregated loading trigger
  const loadAllData = async () => {
    setGlobalLoading(true);
    setErrorBanner(null);
    try {
      await Promise.all([
        fetch('/api/alunos').then(res => res.json()).then(data => setAlunos(data)),
        fetch('/api/estoque').then(res => res.json()).then(data => setEstoque(data)),
        fetch('/api/vendas').then(res => res.json()).then(data => setVendas(data)),
        fetch('/api/dashboard').then(res => res.json()).then(data => setStats(data)),
        loadAppConfig()
      ]);
    } catch (err) {
      setErrorBanner("Erro de conexão com o servidor. Verifique se o backend está executando.");
      console.error("Falha ao puxar dados da API:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Add Student Endpoint Trigger
  const handleAddAluno = async (novoAluno: Omit<Aluno, 'id' | 'data_cadastro'>) => {
    try {
      const res = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAluno)
      });
      if (res.ok) {
        await loadAllData(); // Refresh all aggregates
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Edit Student Endpoint Trigger
  const handleEditAluno = async (id: string, dadosAtualizados: Partial<Aluno>) => {
    try {
      const res = await fetch(`/api/alunos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
      if (res.ok) {
        await loadAllData(); // Refresh all aggregates
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Delete Student Endpoint Trigger
  const handleDeleteAluno = async (id: string) => {
    try {
      const res = await fetch(`/api/alunos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Add Product Endpoint Trigger
  const handleAddProduto = async (novoProd: Omit<Produto, 'id'>) => {
    try {
      const res = await fetch('/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProd)
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Edit Product Endpoint Trigger
  const handleEditProduto = async (id: string, dadosAtualizados: Partial<Produto>) => {
    try {
      const res = await fetch(`/api/estoque/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Delete Product Endpoint Trigger
  const handleDeleteProduto = async (id: string) => {
    try {
      const res = await fetch(`/api/estoque/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // POS Add Sale Endpoint Trigger
  const handleAddVenda = async (dadosVenda: { produto_id: string | null; quantidade: number; total: number; comprador: string }) => {
    try {
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosVenda)
      });
      if (res.ok) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Navigation callbacks
  const navigateToTab = (tab: 'alunos' | 'estoque' | 'vendas') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans" id="app-root-container">
      
      {/* 1. Header Bar Area */}
      <header className="bg-zinc-900 text-white sticky top-0 z-40 border-b-4 border-lime-400 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Visual Brand Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-400 text-black font-black flex items-center justify-center border border-black">
                <Dumbbell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="leading-none">
                <span className="font-display font-black text-xl tracking-tighter uppercase block">
                  Shape<span className="text-lime-400 italic">Control</span>
                </span>
                <span className="block text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-400 uppercase mt-1">
                  SYSTEM CORE // BUILD 1.2.0 // {config?.useSupabase ? 'SUPABASE_ACTIVE' : 'DATABASE_LOCAL'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition duration-150 cursor-pointer rounded-none ${
                  activeTab === 'dashboard' 
                    ? 'bg-lime-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('alunos')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition duration-150 cursor-pointer rounded-none ${
                  activeTab === 'alunos' 
                    ? 'bg-lime-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent'
                }`}
                id="tab-nav-alunos"
              >
                <Users className="w-4 h-4" />
                Alunos
              </button>
              <button
                onClick={() => setActiveTab('estoque')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition duration-150 cursor-pointer rounded-none ${
                  activeTab === 'estoque' 
                    ? 'bg-lime-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <Package className="w-4 h-4" />
                Estoque
              </button>
              <button
                onClick={() => setActiveTab('vendas')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition duration-150 cursor-pointer rounded-none ${
                  activeTab === 'vendas' 
                    ? 'bg-lime-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Vendas
              </button>
            </nav>

            {/* Sub Info, Clock, and DB Indicator */}
            <div className="hidden md:flex items-center gap-4">
              {/* Live Digital Clock */}
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs font-bold bg-zinc-950 px-3 py-1.5 rounded-none border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-lime-400" />
                <span>{currentTime || '--:--:--'}</span>
              </div>

              {/* DB Status Widget Button */}
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none text-xs font-mono font-bold border transition duration-150 cursor-pointer ${
                  config?.useSupabase 
                    ? 'bg-zinc-950 text-lime-400 border-lime-400/55 hover:border-lime-400' 
                    : 'bg-zinc-950 text-yellow-500 border-yellow-500/55 hover:border-yellow-500'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{config?.useSupabase ? 'SUPABASE CONNECTED' : 'DATABASE LOCAL'}</span>
                <span className={`w-1.5 h-1.5 rounded-none inline-block ${
                  config?.useSupabase ? 'bg-lime-400 animate-pulse' : 'bg-yellow-400'
                }`}></span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setActiveTab('config')}
                className={`p-1.5 rounded-none border text-xs font-mono font-bold ${
                  config?.useSupabase ? 'text-lime-400 border-lime-400/40' : 'text-yellow-500 border-yellow-500/40'
                }`}
                title="Configurações Supabase"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-none cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-zinc-800 bg-zinc-900 text-white py-3 px-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-black uppercase ${
                activeTab === 'dashboard' ? 'bg-lime-400 text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('alunos'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-black uppercase ${
                activeTab === 'alunos' ? 'bg-lime-400 text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Alunos
            </button>
            <button
              onClick={() => { setActiveTab('estoque'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-black uppercase ${
                activeTab === 'estoque' ? 'bg-lime-400 text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Package className="w-4 h-4" />
              Estoque
            </button>
            <button
              onClick={() => { setActiveTab('vendas'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-black uppercase ${
                activeTab === 'vendas' ? 'bg-lime-400 text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Vendas
            </button>
            <button
              onClick={() => { setActiveTab('config'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-black uppercase ${
                activeTab === 'config' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Database className="w-4 h-4" />
              Configurações Supabase
            </button>
          </div>
        )}
      </header>

      {/* 2. Top Banner Alerts */}
      {errorBanner && (
        <div className="bg-red-600 text-white font-mono uppercase tracking-wider py-4 px-4 text-center text-xs border-b-4 border-black flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 text-white shrink-0" />
          <span>{errorBanner}</span>
          <button 
            onClick={loadAllData} 
            className="ml-4 px-3 py-1 bg-black text-white text-xs font-black border border-white hover:bg-zinc-900 cursor-pointer transition uppercase"
          >
            TENTAR RECONEXÃO
          </button>
        </div>
      )}

      {/* 3. Main Frame Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {globalLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-14 h-14 border-4 border-lime-400 border-t-transparent animate-spin rounded-none"></div>
            <h3 className="font-sans font-black text-white text-lg mt-6 uppercase tracking-wider">LENDO REGISTROS CORE...</h3>
            <p className="text-xs text-zinc-500 font-mono tracking-widest mt-2 uppercase">SINCRONIZANDO COM OS BANCOS DE DADOS</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Title per tab with motivational micro slogan */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b-2 border-zinc-900 gap-4 mb-4">
              <div>
                <h2 className="font-display font-black text-2xl uppercase text-black bg-white px-3 py-1 w-fit tracking-tight flex items-center gap-2">
                  {activeTab === 'dashboard' && 'Visão Geral do Negócio'}
                  {activeTab === 'alunos' && 'Prontuário de Alunos'}
                  {activeTab === 'estoque' && 'Controle de Almoxarifado'}
                  {activeTab === 'vendas' && 'Central de Vendas e PDV'}
                  {activeTab === 'config' && 'Configurações de Sincronismo'}
                </h2>
                <p className="text-xs font-mono tracking-wider text-zinc-500 mt-2 uppercase">
                  {activeTab === 'dashboard' && 'SYSTEM CORE // EVOLUÇÃO DE FATURAMENTO, MATRÍCULAS ATIVAS E ALERTAS DE ESTOQUE.'}
                  {activeTab === 'alunos' && 'MEMBER LIST // CADASTRO MANUAL DE ATLETAS, PLANOS VIGENTES E RENOVAÇÕES.'}
                  {activeTab === 'estoque' && 'INVENTORY DEPT // MERCADORIAS PARA COMERCIALIZAÇÃO, SUPLEMENTOS E REPOSIÇÃO.'}
                  {activeTab === 'vendas' && 'PDV TERMINAL // CENTRALIZAR FATURAMENTO E CHECKOUT PARA ALUNOS E VISITANTES.'}
                  {activeTab === 'config' && 'DEV TOOLS // CONECTE SEU BANCO SUPABASE OU ACOMPANHE O SALVAMENTO NO BANCO LOCAL.'}
                </p>
              </div>

              {/* Auxiliary Quick Action stats */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 border-2 border-lime-400 rounded-none text-xs font-mono uppercase tracking-wider text-lime-400 font-bold">
                  <span className="w-2 h-2 rounded-none bg-lime-400 inline-block animate-pulse"></span>
                  ACADEMIA ABERTA
                  <span className="text-zinc-700">|</span>
                  <span className="text-white">{stats.totalVendas} VENDAS REGISTRADAS</span>
                </div>
              )}
            </div>

            {/* Selected Panel Render */}
            <div className="transition-all duration-300">
              {activeTab === 'dashboard' && (
                <DashboardTab stats={stats} onNavigateTab={navigateToTab} />
              )}

              {activeTab === 'alunos' && (
                <AlunosTab 
                  alunos={alunos} 
                  onAddAluno={handleAddAluno} 
                  onEditAluno={handleEditAluno} 
                  onDeleteAluno={handleDeleteAluno} 
                />
              )}

              {activeTab === 'estoque' && (
                <EstoqueTab 
                  estoque={estoque} 
                  onAddProduto={handleAddProduto} 
                  onEditProduto={handleEditProduto} 
                  onDeleteProduto={handleDeleteProduto} 
                />
              )}

              {activeTab === 'vendas' && (
                <VendasTab 
                  vendas={vendas} 
                  estoque={estoque} 
                  alunos={alunos} 
                  onAddVenda={handleAddVenda} 
                />
              )}

              {activeTab === 'config' && (
                <SupaConfigCard config={config} onRefresh={loadAllData} />
              )}
            </div>

          </div>
        )}

      </main>

      {/* 4. Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-lime-400 animate-pulse" />
            <span>SESSION_UID: 9872-X-IRON // IRON CORE © 2026 // ALL RIGHTS RESERVED</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('config')}
              className="text-zinc-400 hover:text-white transition cursor-pointer underline flex items-center gap-1 hover:text-lime-400"
            >
              <Database className="w-3.5 h-3.5" />
              SYNCING WITH SUPABASE API...
            </button>
            <span>//</span>
            <span>BUILD 1.2.0 (FULL-STACK CONTAINER)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
