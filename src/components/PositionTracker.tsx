import { useEffect, useId, useMemo, useState } from 'react';
import { Lock, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { InfoTip } from './Simulator';
import { useLiveBtcPrice } from '../hooks/useLiveBtcPrice';

type Currency = 'EUR' | 'USD';

interface Purchase {
  id: string;
  amount: number;
  currency: Currency;
  price: number;
}

interface StoredState {
  baseBtc: number;
  baseAvgPrice: number;
  currentBtcPrice: number;
  purchases: Purchase[];
}

const STORAGE_KEY = 'btc-claude-position-v1';

const DEFAULT_STATE: StoredState = {
  baseBtc: 0,
  baseAvgPrice: 0,
  currentBtcPrice: 0,
  purchases: [],
};

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Stored data is user-editable (and can survive a schema change), so every field
 * is validated rather than trusted — a malformed payload used to crash the page.
 */
function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_STATE;

    const obj = parsed as Record<string, unknown>;
    const rawPurchases = Array.isArray(obj.purchases) ? obj.purchases : [];

    return {
      baseBtc: toNumber(obj.baseBtc),
      baseAvgPrice: toNumber(obj.baseAvgPrice),
      currentBtcPrice: toNumber(obj.currentBtcPrice),
      purchases: rawPurchases
        .filter((p): p is Record<string, unknown> => typeof p === 'object' && p !== null)
        .map(p => ({
          id: typeof p.id === 'string' && p.id ? p.id : makeId(),
          amount: toNumber(p.amount),
          currency: p.currency === 'USD' ? 'USD' : 'EUR',
          price: toNumber(p.price),
        })),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** crypto.randomUUID needs a secure context; fall back so the button never throws. */
function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newPurchase(): Purchase {
  return { id: makeId(), amount: 1000, currency: 'EUR', price: 90000 };
}

function fmtEur(n: number) {
  return `€${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtUsd(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtBtc(n: number) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 8 })} BTC`;
}

export function PositionTracker() {
  const [baseBtc, setBaseBtc] = useState(0);
  const [baseAvgPrice, setBaseAvgPrice] = useState(0);
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const livePrice = useLiveBtcPrice();
  const fieldId = useId();

  // Load once on mount, from this browser only — never from the network or the repo.
  useEffect(() => {
    const state = loadState();
    setBaseBtc(state.baseBtc);
    setBaseAvgPrice(state.baseAvgPrice);
    setCurrentBtcPrice(state.currentBtcPrice);
    setPurchases(state.purchases);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const state: StoredState = { baseBtc, baseAvgPrice, currentBtcPrice, purchases };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, baseBtc, baseAvgPrice, currentBtcPrice, purchases]);

  const { usdToEur, eurToUsd, usingLiveFx } = livePrice;

  const steps = useMemo(() => {
    const safeBaseBtc = Math.max(0, baseBtc || 0);
    const safeBaseAvgPrice = Math.max(0, baseAvgPrice || 0);

    let btc = safeBaseBtc;
    let cost = safeBaseBtc * safeBaseAvgPrice;

    const rows = [{
      label: 'Posición actual',
      btcAdded: null as number | null,
      btc,
      cost,
      avgPrice: btc > 0 ? cost / btc : 0,
    }];

    purchases.forEach((p, i) => {
      const amount = Math.max(0, p.amount || 0);
      const price = Math.max(0, p.price || 0);
      const btcAdded = price > 0 ? amount / price : 0;
      const costAdded = p.currency === 'EUR' ? amount : amount * usdToEur;
      btc += btcAdded;
      cost += costAdded;
      rows.push({
        label: `Compra ${i + 1}`,
        btcAdded,
        btc,
        cost,
        avgPrice: btc > 0 ? cost / btc : 0,
      });
    });

    return rows;
  }, [baseBtc, baseAvgPrice, purchases, usdToEur]);

  const final = steps[steps.length - 1];
  const base = steps[0];
  const avgPriceDelta = final.avgPrice - base.avgPrice;

  const safeCurrentPrice = Math.max(0, currentBtcPrice || 0);
  const unrealizedValue = final.btc * safeCurrentPrice;
  const unrealizedPL = unrealizedValue - final.cost;
  const unrealizedPLPct = final.cost > 0 ? (unrealizedPL / final.cost) * 100 : 0;

  const updatePurchase = (id: string, patch: Partial<Purchase>) => {
    setPurchases(list => list.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePurchase = (id: string) => {
    setPurchases(list => list.filter(p => p.id !== id));
  };

  return (
    <div className="border border-white/10 p-6 md:p-8 bg-white/5 mt-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#F7931A] opacity-5 rounded-full -ml-32 -mt-32 pointer-events-none blur-3xl"></div>

      <div className="relative z-10 space-y-8">
        <div>
          <h3 className="text-sm uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F7931A] rounded-full"></span>
            Simulador de Promediado (DCA)
            <InfoTip text="DCA (Dollar-Cost Averaging) significa comprar en varios tramos en vez de todo de una vez. Cada compra tiene su propio precio, así que tu precio medio de coste va cambiando con cada tramo. Esta herramienta simula ese efecto sobre tu posición." />
          </h3>
          <p className="text-xs opacity-60 font-mono uppercase mb-2">Tu posición + nuevas compras hipotéticas</p>
          <p className="text-[11px] font-mono normal-case opacity-50 leading-relaxed flex items-start gap-1.5">
            <Lock className="w-3 h-3 shrink-0 mt-0.5 text-[#F7931A]" />
            Privado: estos datos se guardan solo en este navegador (localStorage). Nunca se suben al repositorio ni se envían a ningún servidor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border border-white/10 bg-[#0A0A0A]/60 p-3">
          <span className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1.5 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${livePrice.status === 'loading' ? 'bg-white/30 animate-pulse' : livePrice.status === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            BTC en vivo
          </span>

          {livePrice.status === 'error' && (
            <span className="text-[11px] font-mono normal-case opacity-50">No se pudo obtener el precio. Introdúcelo a mano abajo.</span>
          )}

          {livePrice.price && (
            <>
              <span className="font-mono text-sm text-[#F5F5F5]">
                €{livePrice.price.eur.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="font-mono text-sm text-white/50">
                ${livePrice.price.usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              {livePrice.updatedAt && (
                <span className="text-[10px] font-mono opacity-40">
                  actualizado {livePrice.updatedAt.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => setCurrentBtcPrice(Math.round(livePrice.price!.eur))}
                className="text-[10px] uppercase tracking-widest py-1.5 px-2.5 border border-[#F7931A]/40 text-[#F7931A] hover:bg-[#F7931A]/10 transition-colors cursor-pointer"
              >
                Usar como precio de hoy
              </button>
            </>
          )}

          <button
            onClick={livePrice.refresh}
            aria-label="Actualizar precio"
            disabled={livePrice.status === 'loading'}
            className="ml-auto text-white/40 hover:text-[#F7931A] transition-colors cursor-pointer disabled:opacity-30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${livePrice.status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-btc`} className="text-xs uppercase tracking-widest opacity-80 block">BTC en cartera</label>
            <input
              id={`${fieldId}-btc`}
              type="number"
              min={0}
              step="0.00000001"
              value={baseBtc || ''}
              onChange={e => setBaseBtc(Math.max(0, Number(e.target.value) || 0))}
              placeholder="p.ej. 0.05"
              className="w-full bg-[#0A0A0A] border border-white/20 p-2 font-mono text-white outline-none focus:border-[#F7931A] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-avg`} className="text-xs uppercase tracking-widest opacity-80 block">Precio medio actual (€/BTC)</label>
            <input
              id={`${fieldId}-avg`}
              type="number"
              min={0}
              step={1000}
              value={baseAvgPrice || ''}
              onChange={e => setBaseAvgPrice(Math.max(0, Number(e.target.value) || 0))}
              placeholder="p.ej. 95000"
              className="w-full bg-[#0A0A0A] border border-white/20 p-2 font-mono text-white outline-none focus:border-[#F7931A] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-today`} className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              Precio BTC hoy (€)
              <InfoTip text="Opcional. Si lo rellenas, calculamos tu plusvalía/minusvalía latente sobre la posición resultante (actual + compras simuladas)." />
            </label>
            <input
              id={`${fieldId}-today`}
              type="number"
              min={0}
              step={1000}
              value={currentBtcPrice || ''}
              onChange={e => setCurrentBtcPrice(Math.max(0, Number(e.target.value) || 0))}
              placeholder="p.ej. 55000"
              className="w-full bg-[#0A0A0A] border border-white/20 p-2 font-mono text-white outline-none focus:border-[#F7931A] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest opacity-80">Nuevas compras simuladas</label>
            <button
              onClick={() => setPurchases(list => [...list, newPurchase()])}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest py-2 px-3 border border-[#F7931A]/40 text-[#F7931A] hover:bg-[#F7931A]/10 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir compra
            </button>
          </div>

          {purchases.length === 0 && (
            <p className="text-[11px] font-mono normal-case opacity-40 border border-white/10 border-dashed p-4 text-center">
              Sin compras simuladas todavía. Añade una para ver cómo se movería tu precio medio.
            </p>
          )}

          {purchases.map((p, i) => (
            <div key={p.id} className="flex flex-wrap items-end gap-3 border border-white/10 bg-[#0A0A0A]/40 p-3">
              <span className="text-[10px] font-mono opacity-40 w-16">Compra {i + 1}</span>

              <div className="space-y-1">
                <label htmlFor={`${fieldId}-amount-${p.id}`} className="text-[10px] uppercase tracking-widest opacity-60 block">Importe</label>
                <div className="flex bg-[#0A0A0A] border border-white/20 p-1.5">
                  <span className="text-[#F7931A] font-mono mr-1.5 text-sm">{p.currency === 'EUR' ? '€' : '$'}</span>
                  <input
                    id={`${fieldId}-amount-${p.id}`}
                    type="number"
                    min={0}
                    step={500}
                    value={p.amount || ''}
                    onChange={e => updatePurchase(p.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                    className="bg-transparent outline-none font-mono w-24 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor={`${fieldId}-price-${p.id}`} className="text-[10px] uppercase tracking-widest opacity-60 block">Precio de compra</label>
                <div className="flex bg-[#0A0A0A] border border-white/20 p-1.5">
                  <span className="text-[#F7931A] font-mono mr-1.5 text-sm">{p.currency === 'EUR' ? '€' : '$'}</span>
                  <input
                    id={`${fieldId}-price-${p.id}`}
                    type="number"
                    min={0}
                    step={1000}
                    value={p.price || ''}
                    onChange={e => updatePurchase(p.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                    className="bg-transparent outline-none font-mono w-24 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-1">
                {(['EUR', 'USD'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => updatePurchase(p.id, { currency: c })}
                    className={`text-[10px] uppercase tracking-widest py-1.5 px-2.5 border transition-colors cursor-pointer ${
                      p.currency === c
                        ? 'border-[#F7931A] text-[#F7931A] bg-[#F7931A]/10'
                        : 'border-white/20 text-white/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono opacity-50 ml-auto">
                ≈ {(p.price > 0 ? p.amount / p.price : 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} BTC
              </span>

              <button
                onClick={() => removePurchase(p.id)}
                aria-label="Eliminar compra"
                className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(base.btc > 0 || purchases.length > 0) && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
                  <th className="py-2 pr-4">Paso</th>
                  <th className="py-2 pr-4">BTC añadido</th>
                  <th className="py-2 pr-4">BTC acumulado</th>
                  <th className="py-2 pr-4">Coste acumulado</th>
                  <th className="py-2">Precio medio resultante</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i === steps.length - 1 ? 'text-[#F7931A]' : 'text-white/70'}`}>
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4">{row.btcAdded !== null ? fmtBtc(row.btcAdded) : '—'}</td>
                    <td className="py-2 pr-4">{fmtBtc(row.btc)}</td>
                    <td className="py-2 pr-4">{fmtEur(row.cost)}</td>
                    <td className="py-2">{fmtEur(row.avgPrice)}/BTC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(base.btc > 0 || purchases.length > 0) && (
          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Precio medio: antes → después</p>
              <p className="text-lg font-mono text-[#F5F5F5] mt-1">
                {fmtEur(base.avgPrice)} → <span className="text-[#F7931A]">{fmtEur(final.avgPrice)}</span>
              </p>
              <p className="text-sm font-mono text-white/80 mt-0.5">
                {fmtUsd(base.avgPrice * eurToUsd)} → <span className="text-[#F7931A]">{fmtUsd(final.avgPrice * eurToUsd)}</span>
              </p>
              <p className="text-[11px] font-mono text-white/60 mt-1">
                {avgPriceDelta === 0
                  ? 'Sin cambio'
                  : `${avgPriceDelta < 0 ? '↓ baja' : '↑ sube'} ${fmtEur(Math.abs(avgPriceDelta))} · ${fmtUsd(Math.abs(avgPriceDelta) * eurToUsd)}`}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Posición resultante</p>
              <p className="text-lg font-mono text-[#F5F5F5] mt-1">{fmtBtc(final.btc)}</p>
              <p className="text-[10px] font-mono opacity-40 mt-1">Coste total {fmtEur(final.cost)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">P/L latente {safeCurrentPrice === 0 && '(añade precio hoy)'}</p>
              <p className={`text-lg font-mono mt-1 ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {safeCurrentPrice > 0 ? `${fmtEur(unrealizedPL)} (${unrealizedPLPct >= 0 ? '+' : ''}${unrealizedPLPct.toFixed(1)}%)` : '—'}
              </p>
            </div>
          </div>
        )}

        <p className="text-[10px] font-mono normal-case opacity-40 leading-relaxed">
          Herramienta de cálculo, no una recomendación de compra. Conversión USD/EUR usada: 1 $ ≈ {usdToEur.toFixed(4)} € {usingLiveFx ? '(tipo implícito de las cotizaciones en vivo)' : '(aproximación fija: no hay precio en vivo disponible)'}.
        </p>
      </div>
    </div>
  );
}
