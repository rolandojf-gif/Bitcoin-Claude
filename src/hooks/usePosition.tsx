import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Currency = 'EUR' | 'USD';

export interface Purchase {
  id: string;
  amount: number;
  currency: Currency;
  price: number;
}

export interface PositionStep {
  label: string;
  btcAdded: number | null;
  btc: number;
  cost: number;
  avgPrice: number;
}

interface StoredState {
  baseBtc: number;
  /** Total paid for the existing position. Kept as the source of truth (as in a
   *  broker statement) so the average price is derived exactly, not rounded. */
  baseCost: number;
  currentBtcPrice: number;
  purchases: Purchase[];
}

const STORAGE_KEY = 'btc-claude-position-v1';

const DEFAULT_STATE: StoredState = {
  baseBtc: 0,
  baseCost: 0,
  currentBtcPrice: 0,
  purchases: [],
};

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/** crypto.randomUUID needs a secure context; fall back so the button never throws. */
export function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    const baseBtc = toNumber(obj.baseBtc);
    // Older payloads stored the average price instead of the total cost.
    const baseCost = toNumber(obj.baseCost) || baseBtc * toNumber(obj.baseAvgPrice);

    return {
      baseBtc,
      baseCost,
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

export interface PositionState {
  baseBtc: number;
  baseCost: number;
  currentBtcPrice: number;
  purchases: Purchase[];
  setBaseBtc: (v: number) => void;
  setBaseCost: (v: number) => void;
  setCurrentBtcPrice: (v: number) => void;
  addPurchase: () => void;
  updatePurchase: (id: string, patch: Partial<Purchase>) => void;
  removePurchase: (id: string) => void;
  /** Step-by-step effect of each purchase; index 0 is the position as it stands today. */
  steps: PositionStep[];
  /** The position as it stands today, before any simulated purchase. */
  base: PositionStep;
  /** The position after all simulated purchases. */
  final: PositionStep;
  /** True once the user has entered something worth projecting. */
  hasPosition: boolean;
}

const PositionContext = createContext<PositionState | null>(null);

export function PositionProvider({ usdToEur, children }: { usdToEur: number; children: ReactNode }) {
  const [baseBtc, setBaseBtc] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount, from this browser only — never from the network or the repo.
  useEffect(() => {
    const state = loadState();
    setBaseBtc(state.baseBtc);
    setBaseCost(state.baseCost);
    setCurrentBtcPrice(state.currentBtcPrice);
    setPurchases(state.purchases);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const state: StoredState = { baseBtc, baseCost, currentBtcPrice, purchases };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, baseBtc, baseCost, currentBtcPrice, purchases]);

  const steps = useMemo<PositionStep[]>(() => {
    const safeBaseBtc = Math.max(0, baseBtc || 0);

    let btc = safeBaseBtc;
    let cost = Math.max(0, baseCost || 0);

    const rows: PositionStep[] = [{
      label: 'Posición actual',
      btcAdded: null,
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
  }, [baseBtc, baseCost, purchases, usdToEur]);

  const value: PositionState = {
    baseBtc,
    baseCost,
    currentBtcPrice,
    purchases,
    setBaseBtc,
    setBaseCost,
    setCurrentBtcPrice,
    addPurchase: () =>
      setPurchases(list => [...list, { id: makeId(), amount: 1000, currency: 'EUR', price: 90000 }]),
    updatePurchase: (id, patch) =>
      setPurchases(list => list.map(p => (p.id === id ? { ...p, ...patch } : p))),
    removePurchase: id => setPurchases(list => list.filter(p => p.id !== id)),
    steps,
    base: steps[0],
    final: steps[steps.length - 1],
    hasPosition: steps[steps.length - 1].btc > 0,
  };

  return <PositionContext.Provider value={value}>{children}</PositionContext.Provider>;
}

export function usePosition(): PositionState {
  const ctx = useContext(PositionContext);
  if (!ctx) throw new Error('usePosition must be used inside <PositionProvider>');
  return ctx;
}
