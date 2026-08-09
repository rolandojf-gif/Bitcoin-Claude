import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Info } from 'lucide-react';

interface YearPoint {
  year: number;
  value: number;
  btcPrice: number;
}

const BASE_BTC_PRICE_USD = 100000;
// Approximate, fixed rate used only to illustrate the currency toggle — not a live quote.
export const USD_TO_EUR = 0.92;
const YEARS = 10;

function projectScenario(investment: number, m2Growth: number, adoptionRate: number, basePrice: number): YearPoint[] {
  const currentYear = new Date().getFullYear();
  const safeInvestment = Number.isFinite(investment) && investment > 0 ? investment : 0;
  const initialTokens = safeInvestment / basePrice;
  const data: YearPoint[] = [];

  for (let i = 0; i <= YEARS; i++) {
    const priceMultiplier = Math.pow(1 + m2Growth / 100, i) * Math.pow(1 + adoptionRate / 100, i);
    const btcPrice = basePrice * priceMultiplier;
    data.push({ year: currentYear + i, value: initialTokens * btcPrice, btcPrice });
  }

  return data;
}

const PRESETS = [
  { id: 'conservative', label: 'Conservador', m2: 4, adoption: 5 },
  { id: 'base', label: 'Base', m2: 8, adoption: 15 },
  { id: 'bull', label: 'Optimista', m2: 12, adoption: 30 },
] as const;

export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Más información"
        onClick={() => setOpen(o => !o)}
        onBlur={() => setOpen(false)}
        className="text-white/40 hover:text-[#F7931A] transition-colors cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-3 bg-[#151515] border border-white/10 text-[11px] font-mono normal-case tracking-normal text-white/80 leading-relaxed shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

export function Simulator() {
  const [m2Growth, setM2Growth] = useState(8);
  const [adoptionRate, setAdoptionRate] = useState(15);
  const [investment, setInvestment] = useState(10000);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [resizeTick, setResizeTick] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const scalesRef = useRef<{
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
    data: YearPoint[];
  } | null>(null);

  const basePrice = currency === 'USD' ? BASE_BTC_PRICE_USD : BASE_BTC_PRICE_USD * USD_TO_EUR;
  const projection = useMemo(
    () => projectScenario(investment, m2Growth, adoptionRate, basePrice),
    [investment, m2Growth, adoptionRate, basePrice]
  );
  const finalPoint = projection[projection.length - 1];

  const activePreset = PRESETS.find(p => p.m2 === m2Growth && p.adoption === adoptionRate)?.id ?? null;
  const combinedGrowthPct = ((1 + m2Growth / 100) * (1 + adoptionRate / 100) - 1) * 100;

  const symbol = currency === 'USD' ? '$' : '€';
  const fmt = (n: number) => `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Switching currency should convert the actual figures, not just relabel them.
  const handleCurrencyChange = (next: 'USD' | 'EUR') => {
    if (next === currency) return;
    const rate = next === 'EUR' ? USD_TO_EUR : 1 / USD_TO_EUR;
    setInvestment(v => Math.round(v * rate));
    setCurrency(next);
  };

  // Track container resize (the chart needs to know its own pixel width to redraw).
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(() => setResizeTick(t => t + 1));
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    d3.select(chartRef.current).selectAll('*').remove();
    setHoverIdx(null);

    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight || 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const data = projection;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font-family: "Space Mono", monospace;');

    const x = d3.scaleLinear()
      .domain(d3.extent<YearPoint, number>(data, d => d.year) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max<YearPoint, number>(data, d => d.value) || 0]).nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<YearPoint>()
      .x(d => x(d.year))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const area = d3.area<YearPoint>()
      .x(d => x(d.year))
      .y0(y(0))
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'rgba(247, 147, 26, 0.1)')
      .attr('d', area);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(YEARS).tickFormat(d3.format('d')))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '10px'));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => {
        const n = Number(d);
        if (n >= 1000000) return `${symbol}${n / 1000000}M`;
        if (n >= 1000) return `${symbol}${n / 1000}k`;
        return `${symbol}${n}`;
      }))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '10px'));

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)'));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#F7931A')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.selectAll<SVGCircleElement, YearPoint>('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: YearPoint) => x(d.year))
      .attr('cy', (d: YearPoint) => y(d.value))
      .attr('r', 4)
      .attr('fill', '#0A0A0A')
      .attr('stroke', '#F7931A')
      .attr('stroke-width', 2);

    // Hover guide: a vertical dashed line + highlighted point that follows the cursor.
    const focusLine = svg.append('line')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-dasharray', '3,3')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const focusCircle = svg.append('circle')
      .attr('r', 5)
      .attr('fill', '#F7931A')
      .attr('stroke', '#0A0A0A')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const bisectYear = d3.bisector<YearPoint, number>(d => d.year).center;

    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', Math.max(0, width - margin.left - margin.right))
      .attr('height', Math.max(0, height - margin.top - margin.bottom))
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event, svg.node());
        const yearGuess = x.invert(mx);
        const idx = bisectYear(data, yearGuess);
        const d = data[idx];
        if (!d) return;
        focusLine.attr('x1', x(d.year)).attr('x2', x(d.year)).style('opacity', 1);
        focusCircle.attr('cx', x(d.year)).attr('cy', y(d.value)).style('opacity', 1);
        setHoverIdx(idx);
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        focusCircle.style('opacity', 0);
        setHoverIdx(null);
      });

    scalesRef.current = { x, y, data };
  }, [projection, currency, resizeTick]);

  const hoverPoint = hoverIdx !== null ? projection[hoverIdx] : null;
  const hoverPos = hoverPoint && scalesRef.current
    ? { left: scalesRef.current.x(hoverPoint.year), top: scalesRef.current.y(hoverPoint.value) }
    : null;

  return (
    <div className="border border-white/10 p-6 md:p-8 bg-white/5 mt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931A] opacity-5 rounded-full -mr-32 -mt-32 pointer-events-none blur-3xl"></div>

      <div className="flex flex-col md:flex-row gap-12 relative z-10">
        <div className="w-full md:w-1/3 space-y-8">
          <div>
            <h3 className="text-sm uppercase tracking-widest font-bold mb-2 flex items-center">
              <span className="w-2 h-2 bg-[#F7931A] rounded-full mr-2"></span>
              Simulador de Escenarios
            </h3>
            <p className="text-xs opacity-60 font-mono uppercase mb-2">Proyección a 10 años</p>
            <p className="text-[11px] font-mono normal-case opacity-50 leading-relaxed">
              Este modelo combina dos supuestos simples para estimar cómo podría evolucionar el precio de Bitcoin. No es una predicción: es una calculadora de "qué pasaría si".
            </p>
          </div>

          {/* Scenario presets: lets someone explore without understanding the underlying variables first */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-80">Escenario</label>
            <div className="flex gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => { setM2Growth(preset.m2); setAdoptionRate(preset.adoption); }}
                  className={`flex-1 text-[10px] uppercase tracking-widest py-2 border transition-colors cursor-pointer ${
                    activePreset === preset.id
                      ? 'border-[#F7931A] text-[#F7931A] bg-[#F7931A]/10'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {activePreset === null && (
              <p className="text-[10px] font-mono opacity-40">Personalizado (ajustado a mano)</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                  Expansión M2 (Anual)
                  <InfoTip text="M2 mide la cantidad total de dinero fiat en circulación (efectivo, depósitos, ahorros). Cuando los bancos centrales emiten más dinero, el M2 crece y cada dólar o euro existente vale un poco menos. En este modelo, ese porcentaje se traslada directamente al precio de Bitcoin en esa moneda." />
                </label>
                <span className="text-[#F7931A] font-mono text-sm">{m2Growth}%</span>
              </div>
              <input
                type="range"
                min="0" max="25" step="1"
                value={m2Growth}
                onChange={e => setM2Growth(Number(e.target.value))}
                aria-label="Expansión M2 anual en porcentaje"
                className="w-full accent-[#F7931A]"
              />
              <p className="text-[10px] font-mono opacity-40">Emisión global de moneda fiat.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                  Adopción BTC (Anual)
                  <InfoTip text="Estimación de cuánta más gente, empresas y estados usan o invierten en Bitcoin cada año. Como la oferta de BTC es fija, más demanda por el mismo número de monedas suele traducirse en presión al alza sobre el precio." />
                </label>
                <span className="text-[#F7931A] font-mono text-sm">{adoptionRate}%</span>
              </div>
              <input
                type="range"
                min="0" max="50" step="1"
                value={adoptionRate}
                onChange={e => setAdoptionRate(Number(e.target.value))}
                aria-label="Crecimiento de adopción de Bitcoin anual en porcentaje"
                className="w-full accent-[#F7931A]"
              />
              <p className="text-[10px] font-mono opacity-40">Crecimiento de la red e integración institucional.</p>
            </div>

            {/* Plain-language translation of the two sliders into one sentence + a single headline number */}
            <div className="bg-[#0A0A0A] border border-white/10 p-3 space-y-1">
              <p className="text-[11px] font-mono normal-case opacity-70 leading-relaxed">
                Estás asumiendo que el dinero fiat se devalúa un <span className="text-[#F7931A]">{m2Growth}%</span> al año y que la adopción de Bitcoin crece un <span className="text-[#F7931A]">{adoptionRate}%</span> adicional. Combinado, el precio de BTC crecería aproximadamente:
              </p>
              <p className="text-lg font-mono text-[#F7931A]">≈ {combinedGrowthPct.toFixed(1)}% / año</p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={() => handleCurrencyChange('USD')}
                  className={`flex-1 text-xs uppercase tracking-widest py-2 border ${currency === 'USD' ? 'border-[#F7931A] text-[#F7931A] bg-[#F7931A]/10' : 'border-white/20 text-white/60'} transition-colors cursor-pointer`}
                >
                  USD
                </button>
                <button
                  onClick={() => handleCurrencyChange('EUR')}
                  className={`flex-1 text-xs uppercase tracking-widest py-2 border ${currency === 'EUR' ? 'border-[#F7931A] text-[#F7931A] bg-[#F7931A]/10' : 'border-white/20 text-white/60'} transition-colors cursor-pointer`}
                >
                  EUR
                </button>
              </div>
              <p className="text-[10px] font-mono opacity-40">Conversión aproximada (1 $ ≈ {USD_TO_EUR.toFixed(2)} €), solo ilustrativa.</p>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest opacity-80">Inversión Inicial</label>
                <div className="flex bg-[#0A0A0A] border border-white/20 p-2 focus-within:border-[#F7931A] transition-colors">
                  <span className="text-[#F7931A] font-mono mr-2">{symbol}</span>
                  <input
                    type="number"
                    min={0}
                    value={investment}
                    onChange={e => setInvestment(Math.max(0, Number(e.target.value) || 0))}
                    className="bg-transparent outline-none font-mono w-full text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Valor Proyectado ({finalPoint.year})</p>
              <p className="text-3xl font-mono text-[#F5F5F5] mt-1">{fmt(finalPoint.value)}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-widest opacity-60">Precio BTC ({finalPoint.year})</p>
              <p className="text-xl font-mono text-[#F7931A] mt-1">{fmt(finalPoint.btcPrice)}</p>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full relative">
            <div ref={chartRef} className="w-full h-full"></div>
            {hoverPoint && hoverPos && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-[#151515] border border-[#F7931A]/40 px-3 py-2 text-[11px] font-mono whitespace-nowrap shadow-xl z-20"
                style={{ left: hoverPos.left, top: hoverPos.top }}
              >
                <div className="text-white/60">{hoverPoint.year}</div>
                <div className="text-[#F5F5F5]">Cartera: {fmt(hoverPoint.value)}</div>
                <div className="text-[#F7931A]">BTC: {fmt(hoverPoint.btcPrice)}</div>
              </div>
            )}
          </div>

          <p className="text-[10px] font-mono normal-case opacity-40 mt-4 leading-relaxed">
            Modelo educativo con fines ilustrativos. Asume crecimiento compuesto constante, lo cual no ocurre en mercados reales. No es asesoramiento financiero ni garantía de rendimiento futuro.
          </p>
        </div>
      </div>
    </div>
  );
}
