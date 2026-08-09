import { motion } from 'motion/react';

const milestones = [
  {
    date: '2024.01',
    title: 'Integración Institucional',
    desc: 'Wall Street despliega ETFs Spot. La infraestructura financiera tradicional se ancla definitivamente a la red.'
  },
  {
    date: '2024.04',
    title: 'El Cuarto Halving',
    desc: 'Emisión reducida a 3.125 BTC. La tasa de inflación anualizada cae por debajo del 1%, marcando el inicio del shock de oferta.'
  },
  {
    date: '2025.10',
    title: 'Punto de Inflexión M2',
    desc: 'Convergencia de liquidez global. Lo que los analistas denominan "techo" es la fase de consolidación antes de la aceleración fiat.'
  },
  {
    date: '2026.Q3',
    title: 'Teoría de Juegos Soberana',
    desc: 'Adopción a nivel de tesorerías corporativas globales y reservas estratégicas de estados-nación. El "Playbook MicroStrategy".'
  },
  {
    date: '2028.05',
    title: 'Horizonte de Escasez Absoluta',
    desc: 'Quinto halving. Bitcoin se convierte matemáticamente en el activo monetario más duro y escaso de la historia humana.'
  }
];

export function Timeline() {
  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-px bg-[#F7931A]"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Cronología de Absorción
        </h2>
      </div>

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
              <div className="text-[10px] font-mono opacity-60 uppercase tracking-widest mb-2 text-[#F7931A]">
                [ {item.date} ]
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
