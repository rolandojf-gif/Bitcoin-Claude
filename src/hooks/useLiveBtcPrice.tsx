import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface LivePrice {
  usd: number;
  eur: number;
}

export type LiveStatus = 'loading' | 'ready' | 'error';

export interface LiveBtcPrice {
  price: LivePrice | null;
  status: LiveStatus;
  updatedAt: Date | null;
  refresh: () => void;
  /** EUR per 1 USD — implied by the live quotes, or a fixed fallback. */
  usdToEur: number;
  /** USD per 1 EUR. */
  eurToUsd: number;
  /** True when the rate above comes from live quotes rather than the fallback. */
  usingLiveFx: boolean;
}

/** Fallback rate, only used until (or unless) live quotes arrive. */
export const FALLBACK_USD_TO_EUR = 0.92;

const ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur';

function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function useLiveBtcPriceValue(): LiveBtcPrice {
  const [price, setPrice] = useState<LivePrice | null>(null);
  const [status, setStatus] = useState<LiveStatus>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  // Guards against a slow earlier response overwriting a newer one.
  const requestIdRef = useRef(0);

  const refresh = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');

    fetch(ENDPOINT)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (requestId !== requestIdRef.current) return;
        const usd = data?.bitcoin?.usd;
        const eur = data?.bitcoin?.eur;
        if (!isValidPrice(usd) || !isValidPrice(eur)) throw new Error('Malformed response');
        setPrice({ usd, eur });
        setUpdatedAt(new Date());
        setStatus('ready');
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    refresh();
    return () => { requestIdRef.current++; };
  }, [refresh]);

  const usdToEur = price ? price.eur / price.usd : FALLBACK_USD_TO_EUR;

  return {
    price,
    status,
    updatedAt,
    refresh,
    usdToEur,
    eurToUsd: 1 / usdToEur,
    usingLiveFx: price !== null,
  };
}

const LiveBtcPriceContext = createContext<LiveBtcPrice | null>(null);

/** Fetches the BTC quote once and shares it, so the page makes a single API call. */
export function LiveBtcPriceProvider({ children }: { children: ReactNode }) {
  const value = useLiveBtcPriceValue();
  return <LiveBtcPriceContext.Provider value={value}>{children}</LiveBtcPriceContext.Provider>;
}

export function useLiveBtcPrice(): LiveBtcPrice {
  const ctx = useContext(LiveBtcPriceContext);
  if (!ctx) throw new Error('useLiveBtcPrice must be used inside <LiveBtcPriceProvider>');
  return ctx;
}
