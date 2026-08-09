import { motion } from 'motion/react';
import { Lock, Landmark, Globe, TrendingUp, Bitcoin, ChevronDown, BarChart3, ShieldCheck } from 'lucide-react';

import { Timeline } from './components/Timeline';
import { Simulator } from './components/Simulator';

export default function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#F7931A]/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-[#0A0A0A] z-50 border-b border-white/10">
        <div className="flex items-center gap-2 font-bold text-lg uppercase tracking-widest">
          <Bitcoin className="text-[#F7931A]" />
          <span>BTC Macro Tesis</span>
        </div>
        <div className="text-xs font-mono opacity-50 uppercase tracking-tighter">Perspectiva Post-2025</div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 bg-white/5 text-[#F7931A] text-xs font-bold tracking-widest uppercase border border-white/10">
            <TrendingUp className="w-4 h-4" />
            <span>Análisis de Mercado</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-none">
            Desmontando el mito de <br className="hidden md:block" />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #F5F5F5' }}>Octubre 2025</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto mb-16 font-serif italic">
            Creer que Bitcoin alcanzó su techo definitivo ignora los fundamentos matemáticos de su escasez y la teoría de juegos de la adopción institucional global.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col items-center gap-4 opacity-50"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest">Explorar la tesis</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </motion.div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-24 space-y-32">

        {/* Intro */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-none space-y-6"
        >
          <motion.p variants={itemVariants} className="text-2xl md:text-3xl font-serif italic text-[#F7931A] leading-tight">
            Después de los máximos históricos alcanzados en octubre de 2025, el mercado ha experimentado volatilidad y dudas. Muchos analistas tradicionales sugieren que "la burbuja explotó" o que el ciclo de Bitcoin se ha agotado.
          </motion.p>
          <motion.p variants={itemVariants} className="text-lg leading-relaxed opacity-90">
            Esta premisa es fundamentalmente errónea. Confunde una consolidación macroeconómica natural con un techo estructural. La realidad es que los catalizadores de oferta y demanda que impulsaron a Bitcoin a esos niveles no han desaparecido; de hecho, <strong className="font-bold text-white">se están acelerando</strong>. A continuación, explicamos por qué la tendencia alcista sostenida está matemáticamente garantizada.
          </motion.p>
        </motion.section>

        {/* Pillar 1: Scarcity */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-[1fr_2fr] gap-12 items-start border-t border-white/10 pt-12"
        >
          <motion.div variants={itemVariants} className="sticky top-32">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center mb-6 border border-[#F7931A]">
              <Lock className="w-8 h-8 text-[#F7931A]" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Escasez Inelástica Perfecta</h2>
            <p className="text-sm font-mono opacity-60 leading-relaxed uppercase">
              La oferta de Bitcoin es ajena a la demanda. Ningún aumento de precio puede crear más de 21 millones.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="text-lg leading-relaxed opacity-90 space-y-6">
            <p>
              En la economía tradicional, cuando el precio de un activo (como el oro o el petróleo) sube, los productores invierten más capital para extraer más cantidad, lo que eventualmente inunda el mercado y baja el precio. Esto se llama oferta elástica.
            </p>
            <p>
              <strong className="font-bold text-white">Bitcoin es el primer activo con oferta perfectamente inelástica.</strong> Sin importar si el precio llega a un millón de dólares, la red emitirá exactamente la cantidad programada de BTC cada bloque (actualmente mermada tras el halving de 2024).
            </p>
            <div className="bg-white/5 border-l-4 border-[#F7931A] p-6 my-8">
              <h4 className="text-[#F7931A] font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> El Shock de Oferta Silencioso
              </h4>
              <p className="text-base font-serif italic m-0 opacity-90">
                Las métricas on-chain post-2025 demuestran que las reservas de los exchanges continúan cayendo. Las monedas se mueven hacia el almacenamiento en frío (cold storage) por parte de <em>Long-Term Holders</em> (inversores a largo plazo). Con menos liquidez disponible para la venta, cualquier pico de demanda institucional provoca un impacto al alza desproporcionado en el precio.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Pillar 2: Institutional Adoption */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-[2fr_1fr] gap-12 items-start border-t border-white/10 pt-12"
        >
          <motion.div variants={itemVariants} className="text-lg leading-relaxed opacity-90 space-y-6 order-2 md:order-1">
            <p>
              La narrativa de 2024 y 2025 estuvo dominada por los ETFs de Wall Street (BlackRock, Fidelity). Sin embargo, los ETFs fueron solo los "raíles" de infraestructura. La verdadera fase en la que entramos post-2025 es la <strong className="font-bold text-white">Teoría de Juegos Corporativa y Soberana</strong>.
            </p>
            <p>
              Las empresas públicas han comprendido que mantener efectivo en el balance general es una pérdida garantizada frente a la inflación real. El "Playbook de MicroStrategy" se está estandarizando. Además, fondos de pensiones estatales y fondos soberanos de riqueza (países) ya no pueden darse el lujo de tener "cero exposición" a la red de valor más segura del mundo.
            </p>
            <ul className="space-y-4 mt-8">
              {[
                "Asignación obligatoria: Los gestores de riesgo penalizan la falta de BTC como negligencia fiduciaria.",
                "Efecto Red de Liquidez: A mayor adopción, menor volatilidad extrema a la baja, atrayendo aún más capital.",
                "Reservas Estratégicas: Acumulación silenciosa por parte de estados-nación para evadir sanciones o diversificar reservas."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="w-5 h-5 text-[#F7931A] shrink-0 mt-0.5" />
                  <span className="text-sm font-mono opacity-80">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={itemVariants} className="sticky top-32 order-1 md:order-2">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center mb-6 border border-[#F7931A]">
              <Landmark className="w-8 h-8 text-[#F7931A]" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Adopción como Reserva</h2>
            <p className="text-sm font-mono opacity-60 leading-relaxed uppercase">
              Nadie quiere ser el último estado o corporación en adoptar la mejor capa de liquidación global.
            </p>
          </motion.div>
        </motion.section>

        {/* Pillar 3: Macro */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-[1fr_2fr] gap-12 items-start border-t border-white/10 pt-12"
        >
          <motion.div variants={itemVariants} className="sticky top-32">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center mb-6 border border-[#F7931A]">
              <Globe className="w-8 h-8 text-[#F7931A]" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Refugio ante la Degradación Fiat</h2>
            <p className="text-sm font-mono opacity-60 leading-relaxed uppercase">
              El precio de Bitcoin no sube; es el valor de las monedas fiduciarias colapsando frente a activos escasos.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="text-lg leading-relaxed opacity-90 space-y-6">
            <p>
              El argumento bajista asume un entorno macroeconómico estático. Pero la matemática de la deuda soberana global exige devaluación. Los bancos centrales no tienen otra salida matemática que expandir la masa monetaria (imprimir dinero) para financiar déficits perpetuos.
            </p>
            <p>
              Bitcoin es el denominador perfecto. A medida que aumenta la liquidez global, el valor nominal de Bitcoin en dólares o euros <strong className="font-bold text-white">debe subir por definición</strong>. Los máximos de octubre de 2025 simplemente marcaron un nivel de liquidez M2 en ese momento. Cuando el ciclo de relajación cuantitativa (QE) y expansión de crédito se reanuda estructuralmente, esos máximos se convierten en el nuevo soporte.
            </p>
          </motion.div>
        </motion.section>

        {/* Timeline Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="border-t border-white/10 pt-12"
        >
          <Timeline />
          <Simulator />
        </motion.section>
      </main>

      {/* Conclusion */}
      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-5xl font-black tracking-tighter uppercase mb-6">El Veredicto</h2>
          <p className="text-2xl font-serif italic text-[#F7931A] mb-12 max-w-2xl mx-auto leading-tight">
            El techo de octubre de 2025 no fue el final del camino, fue la transición de Bitcoin de un activo emergente a un pilar fundamental del sistema financiero global. La escasez y la adopción institucional garantizan una apreciación sistemática a largo plazo.
          </p>
          <div className="inline-flex items-center gap-3 text-[#F7931A] font-bold tracking-widest uppercase text-xs border border-[#F7931A] px-8 py-4 hover:bg-[#F7931A] hover:text-[#0A0A0A] transition-colors cursor-pointer">
            Hold the Line <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono opacity-40 uppercase border-t border-white/10 p-6">
          <div>© 2026 BTC Macro Tesis // Desmontando el FUD del Techo de Ciclo</div>
          <div className="hidden md:flex gap-8">
            <span>Confianza Algorítmica: 99.9%</span>
            <span>Tendencia: Ultra-Bulls</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
