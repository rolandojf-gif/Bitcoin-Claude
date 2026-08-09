import { motion } from 'motion/react';

const milestones = [
  {
    date: '2024.01',
    kind: 'hecho',
    title: 'Integración Institucional',
    desc: 'La SEC aprueba los ETF spot de Bitcoin en EE. UU. La infraestructura de custodia y distribución de Wall Street queda conectada a la red.'
  },
  {
    date: '2024.04',
    kind: 'hecho',
    title: 'El Cuarto Halving',
    desc: 'La emisión por bloque baja a 3,125 BTC y la inflación anualizada de la oferta cae por debajo del 1 %. Es el dato duro sobre el que descansa el resto del argumento.'
  },
  {
    date: '2025.10',
    kind: 'hecho',
    title: 'Máximo histórico y corrección',
    desc: 'Bitcoin marca máximos y entra en una fase de consolidación. Que sea techo de ciclo o pausa es, a día de hoy, una interpretación — no un hecho establecido.'
  },
  {
    date: '2026 →',
    kind: 'hipótesis',
    title: 'Adopción como reserva',
    desc: 'La tesis asume que tesorerías corporativas y reservas soberanas siguen incorporando BTC. Es el supuesto más frágil de los tres pilares y el que conviene vigilar de cerca.'
  },
  {
    date: '~2028.04',
    kind: 'programado',
    title: 'Quinto Halving',
    desc: 'La emisión vuelve a partirse por dos. La fecha exacta depende del ritmo de bloques, pero el evento en sí está escrito en el protocolo: no depende de ninguna decisión humana.'
  }
];

const kindStyles: Record<string, string> = {
  hecho: 'border-[#F7931A]/40 text-[#F7931A]',
  hipótesis: 'border-white/20 text-white/50',
  programado: 'border-emerald-400/40 text-emerald-400/80',
};

export function Timeline() {
  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="w-12 h-px bg-[#F7931A]"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Cronología de Absorción
        </h2>
      </div>
      <p className="text-[11px] font-mono text-white/70 mb-12 ml-16 leading-relaxed max-w-2xl">
        Cada hito va etiquetado según lo que es: un hecho verificable, un evento ya programado en el
        protocolo, o una hipótesis de la tesis. La distinción es deliberada.
      </p>

      <div className="flex flex-col">
        {milestones.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex gap-6 md:gap-10 group"
          >
            {/* Track */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 border border-[#F7931A] bg-[#0A0A0A] shrink-0 mt-1" />
              {index !== milestones.length - 1 && (
                <div className="w-px h-full bg-white/10 mt-2 mb-2 group-hover:bg-[#F7931A]/30 transition-colors" />
              )}
            </div>

            {/* Content */}
            <div className="pb-12 md:pb-16 -mt-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest text-[#F7931A]">
                  [ {item.date} ]
                </span>
                <span className={`text-[9px] font-mono uppercase tracking-widest border px-1.5 py-0.5 ${kindStyles[item.kind]}`}>
                  {item.kind}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter mb-3">
                {item.title}
              </h3>
              <p className="text-base font-serif italic opacity-90 leading-relaxed text-[#F5F5F5] max-w-xl">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
