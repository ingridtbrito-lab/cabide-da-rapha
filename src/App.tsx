import { useState } from 'react'

type Screen = 'inicio' | 'venda' | 'reembolso' | 'historico'

type Transacao = {
  id: string
  tipo: 'venda' | 'reembolso'
  instagram: string
  quantidade: number
  valor: number
  funcionaria: string
  data: Date
}

const FUNCIONARIAS = ['Lyzandra', 'Nicoly', 'Brenda', 'Alexia']

const TRANSACOES_INICIAIS: Transacao[] = [
]

function fmt(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtHora(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function fmtData(d: Date) {
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${fmtHora(d)}`
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${fmtHora(d)}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${fmtHora(d)}`
}

// ── Bottom nav ─────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  const items: { key: Screen; label: string; icon: string }[] = [
    { key: 'inicio', label: 'Início', icon: '⌂' },
    { key: 'venda', label: 'Venda', icon: '＋' },
    { key: 'reembolso', label: 'Reembolso', icon: '↩' },
    { key: 'historico', label: 'Histórico', icon: '≡' },
  ]
  return (
    <nav style={{ borderTop: '1px solid #1e1e1e' }}
      className="grid grid-cols-4 bg-[#0a0a0a] pb-safe">
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
            active === item.key ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <span className={`text-xl leading-none transition-transform ${active === item.key ? 'scale-110' : ''}`}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}

// ── Tela Início ───────────────────────────────────────────────────────────
function TelaInicio({ transacoes, onNav }: { transacoes: Transacao[]; onNav: (s: Screen) => void }) {
  const hoje = new Date()
  const vendas = transacoes.filter(t => t.tipo === 'venda' && t.data.toDateString() === hoje.toDateString())
  const reembolsos = transacoes.filter(t => t.tipo === 'reembolso' && t.data.toDateString() === hoje.toDateString())
  const totalVendas = vendas.reduce((a, t) => a + t.valor, 0)
  const totalReembolsos = reembolsos.reduce((a, t) => a + t.valor, 0)
  const caixa = totalVendas - totalReembolsos
  const recentes = [...transacoes].sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, 3)

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Segunda, 21 Jul</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Painel</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">L</div>
      </div>

      {/* Caixa */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
        <p className="text-xs text-green-200 uppercase tracking-widest font-medium">Caixa do Dia</p>
        <p className="text-4xl font-bold text-white mt-1">{fmt(caixa)}</p>
        <p className="text-xs text-green-200 mt-3">{vendas.length} venda{vendas.length !== 1 ? 's' : ''} hoje</p>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#111] p-4 border border-[#1e1e1e]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Vendas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{fmt(totalVendas)}</p>
          <p className="text-xs text-zinc-600 mt-1">{vendas.length} pedidos</p>
        </div>
        <div className="rounded-xl bg-[#111] p-4 border border-[#1e1e1e]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Reembolsos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalReembolsos)}</p>
          <p className="text-xs text-zinc-600 mt-1">{reembolsos.length} devoluç{reembolsos.length !== 1 ? 'ões' : 'ão'}</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNav('venda')}
          className="rounded-xl py-3.5 text-sm font-semibold text-black bg-green-400 active:scale-95 transition-transform">
          + Nova Venda
        </button>
        <button onClick={() => onNav('reembolso')}
          className="rounded-xl py-3.5 text-sm font-semibold text-white bg-[#1e1e1e] border border-[#2a2a2a] active:scale-95 transition-transform">
          ↩ Reembolso
        </button>
      </div>

      {/* Recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Últimas transações</p>
          <button onClick={() => onNav('historico')} className="text-xs text-zinc-500">Ver tudo</button>
        </div>
        <div className="flex flex-col gap-2">
          {recentes.map(t => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-[#111] px-4 py-3 border border-[#1e1e1e]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  t.tipo === 'venda' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                }`}>
                  {t.tipo === 'venda' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.instagram}</p>
                  <p className="text-xs text-zinc-500">{t.funcionaria}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.tipo === 'venda' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.tipo === 'reembolso' ? '-' : '+'}{fmt(t.valor)}
                </p>
                <p className="text-xs text-zinc-600">{fmtHora(t.data)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Formulário compartilhado ──────────────────────────────────────────────
function FormTransacao({
  tipo,
  onSubmit,
}: {
  tipo: 'venda' | 'reembolso'
  onSubmit: (t: Omit<Transacao, 'id' | 'data' | 'tipo'>) => void
}) {
  const [instagram, setInstagram] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valor, setValor] = useState('')
  const [funcionaria, setFuncionaria] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const isVenda = tipo === 'venda'
  const cor = isVenda ? 'green' : 'red'
  const tituloBtn = isVenda ? 'Registrar Venda' : 'Registrar Reembolso'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!instagram || !quantidade || !valor || !funcionaria) return
    onSubmit({
      instagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
      quantidade: Number(quantidade),
      valor: parseFloat(valor.replace(',', '.')),
      funcionaria,
    })
    setSucesso(true)
    setInstagram('')
    setQuantidade('')
    setValor('')
    setFuncionaria('')
    setTimeout(() => setSucesso(false), 2500)
  }

  const inputCls = "w-full rounded-xl bg-[#111] border border-[#2a2a2a] text-white text-sm px-4 py-3.5 outline-none focus:border-zinc-500 placeholder-zinc-600 transition-colors"
  const labelCls = "text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1.5"

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="pt-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
          {isVenda ? 'Nova transação' : 'Devolução'}
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">
          {isVenda ? 'Registrar Venda' : 'Registrar Reembolso'}
        </h1>
      </div>

      {sucesso && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          isVenda ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          ✓ {isVenda ? 'Venda registrada com sucesso!' : 'Reembolso registrado com sucesso!'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className={labelCls}>Instagram do comprador</p>
          <input
            className={inputCls}
            placeholder="@username"
            value={instagram}
            onChange={e => setInstagram(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={labelCls}>Qtd. de peças</p>
            <input
              className={inputCls}
              type="number"
              min="1"
              placeholder="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
            />
          </div>
          <div>
            <p className={labelCls}>Valor (R$)</p>
            <input
              className={inputCls}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={e => setValor(e.target.value)}
            />
          </div>
        </div>

        <div>
          <p className={labelCls}>Funcionária</p>
          <div className="grid grid-cols-2 gap-2">
            {FUNCIONARIAS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFuncionaria(f)}
                className={`rounded-xl py-3 text-sm font-medium transition-all border ${
                  funcionaria === f
                    ? cor === 'green'
                      ? 'bg-green-400/10 text-green-400 border-green-400/30'
                      : 'bg-red-400/10 text-red-400 border-red-400/30'
                    : 'bg-[#111] text-zinc-400 border-[#2a2a2a]'
                }`}
              >
                {f.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo */}
        {instagram && quantidade && valor && funcionaria && (
          <div className="rounded-xl bg-[#111] border border-[#2a2a2a] px-4 py-4 flex flex-col gap-1.5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Resumo</p>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Cliente</span>
              <span className="text-white font-medium">{instagram.startsWith('@') ? instagram : `@${instagram}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Peças</span>
              <span className="text-white font-medium">{quantidade}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Valor</span>
              <span className={`font-bold ${isVenda ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(parseFloat(valor.replace(',', '.')) || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Funcionária</span>
              <span className="text-white font-medium">{funcionaria}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full rounded-xl py-4 text-sm font-bold transition-all active:scale-95 mt-1 ${
            isVenda
              ? 'bg-green-400 text-black'
              : 'bg-red-500 text-white'
          } disabled:opacity-40`}
          disabled={!instagram || !quantidade || !valor || !funcionaria}
        >
          {tituloBtn}
        </button>
      </form>
    </div>
  )
}

// ── Tela Histórico ────────────────────────────────────────────────────────
function TelaHistorico({ transacoes }: { transacoes: Transacao[] }) {
  const [filtro, setFiltro] = useState<'todos' | 'venda' | 'reembolso'>('todos')
  const ordenadas = [...transacoes].sort((a, b) => b.data.getTime() - a.data.getTime())
  const filtradas = ordenadas.filter(t => filtro === 'todos' || t.tipo === filtro)

  const total = filtradas.reduce((a, t) => t.tipo === 'venda' ? a + t.valor : a - t.valor, 0)

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="pt-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Todas as transações</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Histórico</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['todos', 'venda', 'reembolso'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              filtro === f
                ? f === 'venda'
                  ? 'bg-green-400/10 text-green-400 border-green-400/30'
                  : f === 'reembolso'
                  ? 'bg-red-400/10 text-red-400 border-red-400/30'
                  : 'bg-white/10 text-white border-white/20'
                : 'bg-[#111] text-zinc-500 border-[#1e1e1e]'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'venda' ? 'Vendas' : 'Reemb.'}
          </button>
        ))}
      </div>

      {/* Saldo filtrado */}
      <div className="rounded-xl bg-[#111] border border-[#1e1e1e] px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{filtradas.length} transações</span>
        <span className={`text-sm font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {total >= 0 ? '+' : ''}{fmt(total)}
        </span>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtradas.map(t => (
          <div key={t.id} className="rounded-xl bg-[#111] border border-[#1e1e1e] px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${
                  t.tipo === 'venda' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                }`}>
                  {t.tipo === 'venda' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.instagram}</p>
                  <p className="text-xs text-zinc-500">{t.funcionaria} · {t.quantidade} peça{t.quantidade !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.tipo === 'venda' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.tipo === 'reembolso' ? '-' : '+'}{fmt(t.valor)}
                </p>
                <p className="text-xs text-zinc-600">{fmtData(t.data)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  const [transacoes, setTransacoes] = useState<Transacao[]>(TRANSACOES_INICIAIS)

  const addTransacao = (tipo: 'venda' | 'reembolso') => (dados: Omit<Transacao, 'id' | 'data' | 'tipo'>) => {
    setTransacoes(prev => [{
      ...dados,
      id: String(Date.now()),
      tipo,
      data: new Date(),
    }, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      {/* iPhone frame */}
      <div
        className="relative flex flex-col bg-[#0a0a0a] overflow-hidden"
        style={{
          width: 393,
          height: 852,
          borderRadius: 55,
          boxShadow: '0 0 0 2px #3a3a3c, 0 0 0 14px #1c1c1e, 0 0 0 16px #3a3a3c, 0 50px 100px rgba(0,0,0,0.9)',
        }}
      >
        {/* iOS status bar */}
        <div className="flex items-center justify-between px-8 bg-[#0a0a0a] flex-shrink-0" style={{ paddingTop: 14, paddingBottom: 6 }}>
          <span className="text-[15px] font-semibold text-white" style={{ letterSpacing: '-0.3px' }}>9:41</span>
          {/* Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-black rounded-full" style={{ width: 126, height: 37 }} />
          {/* iOS status icons */}
          <div className="flex items-center gap-[6px]">
            {/* Signal bars */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
              <rect x="0" y="4" width="3" height="8" rx="1" />
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" />
              <rect x="9" y="1" width="3" height="11" rx="1" />
              <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
              <path d="M8 6.5C9.9 6.5 11.6 7.3 12.8 8.5L11.4 9.9C10.5 9 9.3 8.5 8 8.5s-2.5.5-3.4 1.4L3.2 8.5C4.4 7.3 6.1 6.5 8 6.5z" />
              <path d="M8 3C10.8 3 13.3 4.1 15.1 5.9L13.7 7.3C12.3 5.9 10.3 5 8 5S3.7 5.9 2.3 7.3L.9 5.9C2.7 4.1 5.2 3 8 3z" opacity="0.5" />
            </svg>
            {/* Battery */}
            <div className="flex items-center">
              <div className="relative flex items-center justify-end" style={{ width: 25, height: 12 }}>
                <div className="absolute inset-0 rounded-[3px] border border-white/60" />
                <div className="absolute left-[2px] top-[2px] bottom-[2px] right-[2px] bg-white rounded-[2px]" style={{ right: 3 }} />
                <div className="absolute -right-[3px] top-[3.5px] w-[2px] h-[5px] bg-white/60 rounded-r-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {screen === 'inicio' && <TelaInicio transacoes={transacoes} onNav={setScreen} />}
          {screen === 'venda' && <FormTransacao tipo="venda" onSubmit={addTransacao('venda')} />}
          {screen === 'reembolso' && <FormTransacao tipo="reembolso" onSubmit={addTransacao('reembolso')} />}
          {screen === 'historico' && <TelaHistorico transacoes={transacoes} />}
        </div>

        {/* Bottom nav */}
        <BottomNav active={screen} onChange={setScreen} />
        {/* iOS home indicator */}
        <div className="flex justify-center pb-2 pt-1 bg-[#0a0a0a] flex-shrink-0">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}
