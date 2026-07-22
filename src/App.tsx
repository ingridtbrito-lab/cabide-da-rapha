import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'venda' | 'reembolso'>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje')

  function getInicio(periodo: 'hoje' | 'semana' | 'mes') {
    const agora = new Date()
    if (periodo === 'hoje') {
      return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    }
    if (periodo === 'semana') {
      const dia = agora.getDay()
      const diff = agora.getDate() - dia + (dia === 0 ? -6 : 1)
      return new Date(agora.getFullYear(), agora.getMonth(), diff)
    }
    return new Date(agora.getFullYear(), agora.getMonth(), 1)
  }

  const inicio = getInicio(filtroPeriodo)
  const ordenadas = [...transacoes].sort((a, b) => b.data.getTime() - a.data.getTime())
  const filtradas = ordenadas.filter(t => {
    const dentroDoTipo = filtroTipo === 'todos' || t.tipo === filtroTipo
    const dentroDoPeriodo = t.data >= inicio
    return dentroDoTipo && dentroDoPeriodo
  })

  const total = filtradas.reduce((a, t) => t.tipo === 'venda' ? a + t.valor : a - t.valor, 0)
  const totalVendas = filtradas.filter(t => t.tipo === 'venda').reduce((a, t) => a + t.valor, 0)
  const totalReembolsos = filtradas.filter(t => t.tipo === 'reembolso').reduce((a, t) => a + t.valor, 0)

  const periodos = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mês' },
  ] as const

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="pt-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Todas as transações</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Histórico</h1>
      </div>

      {/* Filtro período */}
      <div className="flex gap-2">
        {periodos.map(p => (
          <button
            key={p.key}
            onClick={() => setFiltroPeriodo(p.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              filtroPeriodo === p.key
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-[#111] text-zinc-500 border-[#1e1e1e]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Filtro tipo */}
      <div className="flex gap-2">
        {(['todos', 'venda', 'reembolso'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltroTipo(f)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              filtroTipo === f
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

      {/* Resumo do período */}
      <div className="rounded-xl bg-[#111] border border-[#1e1e1e] px-4 py-3 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{filtradas.length} transações</span>
          <span className={`text-sm font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {total >= 0 ? '+' : ''}{fmt(total)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-600">Vendas</span>
          <span className="text-xs text-green-400 font-medium">{fmt(totalVendas)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-600">Reembolsos</span>
          <span className="text-xs text-red-400 font-medium">{fmt(totalReembolsos)}</span>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtradas.length === 0 && (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Nenhuma transação neste período
          </div>
        )}
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
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [carregando, setCarregando] = useState(true)

  // Busca todas as transações do banco ao abrir o app
  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar:', error)
      } else {
        const formatadas = data.map((t: any) => ({
          ...t,
          data: new Date(t.created_at),
        }))
        setTransacoes(formatadas)
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  const addTransacao = (tipo: 'venda' | 'reembolso') => async (dados: Omit<Transacao, 'id' | 'data' | 'tipo'>) => {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([{ tipo, ...dados }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar:', error)
      return
    }

    setTransacoes(prev => [{
      ...data,
      data: new Date(data.created_at),
    }, ...prev])
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {screen === 'inicio' && <TelaInicio transacoes={transacoes} onNav={setScreen} />}
        {screen === 'venda' && <FormTransacao tipo="venda" onSubmit={addTransacao('venda')} />}
        {screen === 'reembolso' && <FormTransacao tipo="reembolso" onSubmit={addTransacao('reembolso')} />}
        {screen === 'historico' && <TelaHistorico transacoes={transacoes} />}
      </div>
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}