import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Trash2, 
  Filter, 
  UserCheck, 
  UserX,
  X,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { Aluno } from '../types';

interface AlunosTabProps {
  alunos: Aluno[];
  onAddAluno: (aluno: Omit<Aluno, 'id' | 'data_cadastro'>) => Promise<boolean>;
  onEditAluno: (id: string, aluno: Partial<Aluno>) => Promise<boolean>;
  onDeleteAluno: (id: string) => Promise<boolean>;
}

export default function AlunosTab({ alunos, onAddAluno, onEditAluno, onDeleteAluno }: AlunosTabProps) {
  const [search, setSearch] = useState('');
  const [filterPlano, setFilterPlano] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal controllers
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  // Form states
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formPlano, setFormPlano] = useState<'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('Mensal');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formDataVencimento, setFormDataVencimento] = useState('');
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper inside component to calculate automated expiration date
  const calculateExpiryDate = (planoSelecionado: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual') => {
    const today = new Date();
    switch (planoSelecionado) {
      case 'Mensal': today.setMonth(today.getMonth() + 1); break;
      case 'Trimestral': today.setMonth(today.getMonth() + 3); break;
      case 'Semestral': today.setMonth(today.getMonth() + 6); break;
      case 'Anual': today.setMonth(today.getMonth() + 12); break;
    }
    // format as 'YYYY-MM-DD'
    return today.toISOString().split('T')[0];
  };

  // When opening modal
  const handleOpenAddModal = () => {
    setEditingAluno(null);
    setFormNome('');
    setFormEmail('');
    setFormTelefone('');
    setFormPlano('Mensal');
    setFormStatus('Ativo');
    // Default vencimento is next month
    setFormDataVencimento(calculateExpiryDate('Mensal'));
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormNome(aluno.nome);
    setFormEmail(aluno.email);
    setFormTelefone(aluno.telefone);
    setFormPlano(aluno.plano);
    setFormStatus(aluno.status);
    setFormDataVencimento(aluno.data_vencimento ? aluno.data_vencimento.split('T')[0] : '');
    setFormError('');
    setShowFormModal(true);
  };

  // Automatically update expiration preview when plan details change
  const handlePlanoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plano = e.target.value as any;
    setFormPlano(plano);
    if (!editingAluno) {
      setFormDataVencimento(calculateExpiryDate(plano));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError('O nome completo do aluno é obrigatório');
      return;
    }
    if (!formDataVencimento) {
      setFormError('A data de vencimento da matrícula ou plano é obrigatória');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const alunoDados = {
        nome: formNome.trim(),
        email: formEmail.trim(),
        telefone: formTelefone.trim(),
        plano: formPlano,
        status: formStatus,
        data_vencimento: new Date(formDataVencimento).toISOString()
      };

      let success = false;
      if (editingAluno) {
        success = await onEditAluno(editingAluno.id, alunoDados);
      } else {
        success = await onAddAluno(alunoDados);
      }

      if (success) {
        setShowFormModal(false);
      } else {
        setFormError('Ocorreu um erro ao salvar o aluno. Verifique se o banco de dados está operacional.');
      }
    } catch (err) {
      setFormError('Falha crítica de comunicação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format due date
  const formatDateBR = (val: string) => {
    try {
      const date = new Date(val);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return val;
    }
  };

  // Check if membership is expired
  const isOverdue = (vencimentoStr: string, status: string) => {
    if (status !== 'Ativo') return false;
    try {
      const expiry = new Date(vencimentoStr);
      const now = new Date();
      now.setHours(0,0,0,0);
      return expiry.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // Clean filters
  const resetFilters = () => {
    setSearch('');
    setFilterPlano('');
    setFilterStatus('');
  };

  const handleQuickToggleStatus = async (aluno: Aluno) => {
    const novoStatus = aluno.status === 'Ativo' ? 'Inativo' : 'Ativo';
    await onEditAluno(aluno.id, { status: novoStatus });
  };

  const handleDeleteClick = async (aluno: Aluno) => {
    if (confirm(`Tem certeza que deseja remover o cadastro do aluno "${aluno.nome}"? Certifique-se que o usuário não possua pendências.`)) {
      await onDeleteAluno(aluno.id);
    }
  };

  // Filter and search computation
  const filteredAlunos = alunos.filter((aluno) => {
    const matchesSearch = 
      aluno.nome.toLowerCase().includes(search.toLowerCase()) ||
      aluno.email.toLowerCase().includes(search.toLowerCase()) ||
      aluno.telefone.includes(search);
    
    const matchesPlano = filterPlano === '' || aluno.plano === filterPlano;
    const matchesStatus = filterStatus === '' || aluno.status === filterStatus;

    return matchesSearch && matchesPlano && matchesStatus;
  });

  return (
    <div className="space-y-6" id="alunos-tab">
      
      {/* Search and Filters Header */}
      <div className="bg-zinc-900 p-5 rounded-none border-2 border-zinc-800">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Live Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="BUSCAR POR NOME, EMAIL OU TELEFONE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-xs bg-zinc-800 border-none text-white rounded-none focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
              />
            </div>

            {/* Plan Filter */}
            <div className="relative">
              <select
                value={filterPlano}
                onChange={(e) => setFilterPlano(e.target.value)}
                className="w-full px-3 py-3 text-xs bg-zinc-800 border-none text-white rounded-none focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
              >
                <option value="">TODOS PLANOS</option>
                <option value="Mensal">MENSAL</option>
                <option value="Trimestral">TRIMESTRAL</option>
                <option value="Semestral">SEMESTRAL</option>
                <option value="Anual">ANUAL</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-3 text-xs bg-zinc-800 border-none text-white rounded-none focus:ring-2 focus:ring-lime-400 focus:outline-none uppercase font-mono"
              >
                <option value="">TODOS STATUS</option>
                <option value="Ativo">APENAS ATIVOS</option>
                <option value="Inativo">APENAS INATIVOS</option>
              </select>
            </div>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-3 shrink-0">
            {(search || filterPlano || filterStatus) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-4 py-3 text-xs font-bold font-mono bg-zinc-800 text-lime-400 hover:text-white rounded-none transition cursor-pointer border border-zinc-700 uppercase"
              >
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> LIMPAR
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 text-xs font-black text-black bg-lime-400 hover:bg-white rounded-none transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase"
              id="btn-adicionar-aluno"
            >
              <Plus className="w-4 h-4" /> NOCO ALUNO
            </button>
          </div>

        </div>
      </div>

      {/* Database Student List Table */}
      <div className="bg-zinc-900 rounded-none border-2 border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-800 border-b-2 border-zinc-900 text-zinc-400 font-bold font-mono text-[9px] uppercase tracking-wider">
                <th className="py-4 px-6">Nome / Cadastro</th>
                <th className="py-4 px-4">Contatos</th>
                <th className="py-4 px-4">Tipo de Plano</th>
                <th className="py-4 px-4">Vencimento</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono uppercase tracking-widest text-[10px]">
                    {alunos.length === 0 ? 'NENHUM ALUNO REGISTRADO.' : 'NENHUM ALUNO CORRESPONDE AOS FILTROS FILTRADOS.'}
                  </td>
                </tr>
              ) : (
                filteredAlunos.map((aluno) => {
                  const overdue = isOverdue(aluno.data_vencimento, aluno.status);
                  return (
                    <tr key={aluno.id} className="hover:bg-zinc-850/40 transition group border-b border-zinc-855">
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="font-black text-white text-sm uppercase group-hover:text-lime-400 transition truncate">{aluno.nome}</div>
                        <div className="text-[10px] font-bold text-zinc-500 mt-1 font-mono uppercase">
                          CADASTRADO: {formatDateBR(aluno.data_cadastro)}
                        </div>
                      </td>
                      <td className="py-4 px-4 min-w-[150px]">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px] font-bold">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> {aluno.telefone || "Sem telefone"}
                        </div>
                        {aluno.email && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mt-0.5 truncate max-w-[170px] uppercase font-mono">
                            <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" /> {aluno.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-white text-black text-[10px] font-black px-2 py-1 rounded-none uppercase">
                          <CreditCard className="w-3 h-3 text-black" />
                          {aluno.plano.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {overdue ? (
                          <span className="inline-flex items-center gap-1 bg-red-950/40 text-red-400 border border-red-800/40 text-[10px] font-mono font-bold px-2 py-1 rounded-none uppercase">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse font-bold" />
                            {formatDateBR(aluno.data_vencimento)} (VENCIDO)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-300 font-mono font-bold text-xs uppercase">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {formatDateBR(aluno.data_vencimento)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleQuickToggleStatus(aluno)}
                          title="Clique para alternar status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-mono font-extrabold cursor-pointer transition border uppercase ${
                            aluno.status === 'Ativo' 
                              ? 'bg-lime-950/40 text-lime-400 border-lime-800/40 hover:bg-lime-400 hover:text-black hover:border-lime-400' 
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-200 hover:text-black hover:border-white'
                          }`}
                        >
                          {aluno.status === 'Ativo' ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              ATIVO
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              INATIVO
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-zinc-400">
                          <button
                            onClick={() => handleOpenEditModal(aluno)}
                            className="p-1.5 text-zinc-400 hover:text-lime-400 hover:bg-zinc-800 rounded-none border border-zinc-800 transition"
                            title="Editar Aluno"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(aluno)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-none border border-zinc-800 transition"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-zinc-950 border-t border-zinc-850 text-zinc-500 text-[9px] font-mono uppercase tracking-wider flex justify-between items-center">
          <span>REGISTROS: {filteredAlunos.length} DE {alunos.length} ALUNOS</span>
          <span>DICA: MATRÍCULAS EXPIRADAS SÃO MARCADAS COM SINALIZADOR DE ALERTA VERMELHO</span>
        </div>
      </div>

      {/* Add / Edit Form Modal Dialog Description */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" id="form-modal">
          <div className="bg-zinc-900 text-white rounded-none w-full max-w-lg border-2 border-lime-400 shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="p-6 border-b-2 border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="font-display font-black text-lime-400 uppercase text-base flex items-center gap-2">
                <User className="w-5 h-5 text-lime-400" />
                {editingAluno ? 'EDITAR CORPO CADASTRO' : 'REGISTRAR ATLETA CORE'}
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

                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Souza"
                    className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-medium placeholder-zinc-500 uppercase"
                  />
                </div>

                {/* Contact Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Telefone Contato</label>
                    <input
                      type="text"
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-bold placeholder-zinc-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Email eletrônico</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Ex: carlos@email.com"
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-medium placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Plan parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Plano Select */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Plano</label>
                    <select
                      value={formPlano}
                      onChange={handlePlanoChange}
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-black font-mono uppercase"
                    >
                      <option value="Mensal">Mensal (R$ 89,90/mês)</option>
                      <option value="Trimestral">Trimestral (R$ 79,90/mês)</option>
                      <option value="Semestral">Semestral (R$ 69,90/mês)</option>
                      <option value="Anual">Anual (R$ 59,90/mês)</option>
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Status de Acesso</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-black font-mono uppercase"
                    >
                      <option value="Ativo">🟢 Ativo (Acesso Liberado)</option>
                      <option value="Inativo">🔴 Inativo (Bloqueado)</option>
                    </select>
                  </div>
                </div>

                {/* Date Expiry */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Data de Vencimento *</label>
                    {!editingAluno && (
                      <span className="text-[9px] font-mono font-bold text-black bg-lime-400 px-1.5 py-0.5 rounded-none uppercase">
                        CÁLCULO AUTOMÁTICO
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={formDataVencimento}
                    onChange={(e) => setFormDataVencimento(e.target.value)}
                    className="w-full bg-zinc-800 border-none p-3 text-sm focus:ring-2 focus:ring-lime-400 text-white rounded-none font-mono font-extrabold"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed font-mono uppercase">
                    {editingAluno 
                      ? 'Em caso de renovação financeira, atualize a data limite correspondente ao pagamento.' 
                      : 'O vencimento foi estimado com base nas vigências do termo do plano escolhido.'
                    }
                  </p>
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
                      <span>SALVANDO...</span>
                    </>
                  ) : (
                    <span>{editingAluno ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR NO DECK'}</span>
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
