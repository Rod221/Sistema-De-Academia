import React, { useState } from 'react';
import { Database, Copy, Check, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';

interface SupaConfigCardProps {
  config: {
    useSupabase: boolean;
    supabaseStatus: {
      configured: boolean;
      connected: boolean;
      tablesFound: boolean;
      error?: string;
    };
    sqlSchema: string;
    supabaseInfo?: {
      url?: string;
    };
  } | null;
  onRefresh: () => void;
}

export default function SupaConfigCard({ config, onRefresh }: SupaConfigCardProps) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleCopy = () => {
    if (config?.sqlSchema) {
      navigator.clipboard.writeText(config.sqlSchema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!config) {
    return (
      <div className="bg-zinc-900 rounded-none p-6 border-2 border-zinc-850 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded-none w-1/3 mb-4"></div>
        <div className="h-4 bg-zinc-800 rounded-none w-full mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded-none w-2/3"></div>
      </div>
    );
  }

  const { useSupabase, supabaseStatus, supabaseInfo, sqlSchema } = config;

  return (
    <div className="bg-zinc-900 rounded-none border-2 border-zinc-800 overflow-hidden text-white" id="supa-config-card">
      <div className="p-6 border-b-2 border-zinc-850 bg-zinc-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-none border ${useSupabase ? 'bg-lime-950/40 text-lime-400 border-lime-800/40' : 'bg-amber-950/40 text-amber-500 border-amber-800/40'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white uppercase text-sm tracking-tight">INTEGRAÇÃO COM SUPABASE</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">Sincronismo direto persistente de dados em nuvem</p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 text-xs font-black font-mono uppercase bg-zinc-800 hover:bg-zinc-700 text-lime-400 hover:text-white rounded-none border border-zinc-700 transition cursor-pointer"
          >
            VERIFICAR CONEXÃO
          </button>
        </div>

        {/* Status Alert block */}
        <div className="mt-5">
          {useSupabase ? (
            <div className="flex items-start gap-3 bg-lime-950/40 border border-lime-800/40 text-lime-300 p-4 rounded-none font-mono uppercase text-[10px] leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-lime-405 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs">SUPABASE CONECTADO E ATIVO! 🎉</p>
                <p className="text-zinc-400 mt-1 pb-1">
                  O sistema está se comunicando em tempo real com seu banco de dados Supabase no endereço:{' '}
                  <span className="font-mono bg-lime-900/60 text-white px-2 py-0.5 border border-lime-800 rounded-none block sm:inline-block break-all mt-1 sm:mt-0">{supabaseInfo?.url || 'sua-instancia'}</span>. 
                  Todos os cadastros e faturamentos estão sendo gravados instantaneamente na nuvem!
                </p>
              </div>
            </div>
          ) : supabaseStatus.connected && !supabaseStatus.tablesFound ? (
            <div className="flex items-start gap-3 bg-amber-955/40 border border-amber-800/40 text-amber-400 p-4 rounded-none font-mono uppercase text-[10px] leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs">CONECTADO AO BANCO, MAS AS TABELAS NÃO FORAM LOCADAS</p>
                <p className="text-zinc-450 mt-1">
                  Sua chave do Supabase é válida! No entanto, as tabelas necessárias (<code className="font-mono bg-zinc-805 px-1 pb-0.5 border border-zinc-700 rounded-none">alunos</code>, <code className="font-mono bg-zinc-805 px-1 pb-0.5 border border-zinc-700 rounded-none">estoque</code>, <code className="font-mono bg-zinc-805 px-1 pb-0.5 border border-zinc-700 rounded-none">vendas</code>) não foram inicializadas ou não existem. 
                  Execute o script SQL abaixo no painel do Supabase para criar as tabelas instantaneamente.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="mt-3 text-xs font-black text-amber-500 hover:text-white underline block cursor-pointer"
                >
                  {showSql ? 'OCULTAR SCRIPT SQL' : 'VISUALIZAR SCRIPT SQL DE CONFIGURAÇÃO'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-zinc-950/80 border border-zinc-800 text-zinc-400 p-4 rounded-none font-mono uppercase text-[10px] leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-white text-xs">MODO DE APRESENTAÇÃO ATIVO (BANCO LOCAL CONTAINER)</p>
                <p className="text-zinc-500 mt-1 leading-relaxed">
                  Não existem credenciais do Supabase configuradas no painel de segredos (Secrets) do AI Studio, ou as que estão lá encontram-se inválidas.{' '}
                  <span className="text-lime-400">O sistema está rodando normalmente</span> salvando todas as suas operações locais (<code className="bg-zinc-805 px-1">data.json</code>). Faça novos cadastros, registre vendas e acompanhe suas estatísticas de forma direta! Ele se manterá persistente de forma segura no container.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSql(!showSql)}
                    className="text-[10px] font-black text-lime-400 hover:text-white underline cursor-pointer"
                  >
                    {showSql ? 'OCULTAR SCRIPT SQL' : 'VER INSTRUÇÕES DE IMPLANTAÇÃO SQL'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSql && (
        <div className="p-6 bg-zinc-950 text-zinc-300 border-t-2 border-zinc-855 font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black">
              <Terminal className="w-4 h-4 text-lime-400" />
              <span>SCRIPT SQL DE INSTALAÇÃO</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-zinc-800 hover:bg-zinc-700 text-lime-400 hover:text-white transition cursor-pointer border border-zinc-700 uppercase font-mono text-[10px] font-black"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
                  <span className="text-lime-400">COPIADO!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPIAR SQL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-zinc-500 mb-4 text-[10px] leading-relaxed uppercase">
            -- DIREÇÕES:<br />
            -- 1. CLIQUE EM "SQL EDITOR" NO SIDEBAR DO SUPABASE PORTAL<br />
            -- 2. CRIE UMA QUERY, COLE O BLOCÃO ABAIXO E APERTE EM "RUN"<br />
            -- 3. ADICIONE AS DUAS CHAVES "SUPABASE_URL" E "SUPABASE_ANON_KEY" NOS SEGREDOS DO PAINEL DO GOOGLE STUDIO!
          </p>
          <pre className="overflow-x-auto p-4 bg-black/80 rounded-none border border-zinc-850 text-zinc-300 max-h-64 leading-relaxed font-mono text-[11px]">
            {sqlSchema}
          </pre>
        </div>
      )}
    </div>
  );
}
