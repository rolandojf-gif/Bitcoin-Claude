# BTC Macro Tesis

Ensayo interactivo sobre por qué el máximo de Bitcoin de octubre de 2025 puede
leerse como una consolidación y no como un techo estructural — acompañado de dos
herramientas para que el lector ponga a prueba el argumento con sus propios números
en lugar de aceptarlo tal cual.

**En vivo:** https://bitcoin-claude.netlify.app

---

## Qué contiene

**El ensayo.** Tres pilares: la oferta inelástica del protocolo, la adopción
institucional, y la dilución monetaria como denominador. Cada afirmación está
etiquetada según lo que realmente es: la escasez es un hecho del protocolo, la
adopción es una hipótesis. La cronología marca cada hito como `hecho`,
`programado` o `hipótesis` de forma explícita.

**Simulador de escenarios.** Proyecta a 10 años combinando dos supuestos anuales
—expansión monetaria (M2) y crecimiento de adopción— sobre el precio spot real.
Incluye presets (conservador / base / optimista) y explicaciones en lenguaje llano
de qué significa cada variable, para que sea usable sin saber qué es un agregado
monetario. No es una previsión: es una calculadora de "qué pasaría si".

**Calculadora de promediado (DCA).** Partiendo de una posición existente (BTC y
precio medio de coste), simula compras adicionales y muestra paso a paso cómo se
movería el precio medio y el resultado latente. Admite importes en euros o dólares
por compra.

> **Privacidad:** los datos de posición se guardan únicamente en el `localStorage`
> del navegador. No se envían a ningún servidor, no salen del dispositivo y no
> hay ninguna cifra personal en este repositorio.

---

## Datos de mercado

El precio de BTC (USD y EUR) viene de la [API pública de CoinGecko](https://www.coingecko.com/en/api),
sin clave y con una sola petición por carga de página compartida entre ambas
herramientas. El tipo de cambio USD/EUR se deriva de esas dos cotizaciones. Si la
API no responde, la interfaz lo indica y permite introducir el precio a mano.

## Desarrollo

```bash
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Comprobación de tipos con `tsc --noEmit` |

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS v4 · D3 (gráfico) ·
Motion (animaciones) · lucide-react (iconos).

## Despliegue

Netlify, con `netlify.toml` en la raíz (`npm run build` → `dist/`). Si el sitio
está enlazado al repositorio en Netlify, cada push a `main` publica automáticamente.

---

## Aviso

Esto es una tesis personal y una herramienta de cálculo. **No es asesoramiento
financiero.** Los escenarios asumen crecimiento compuesto constante, algo que no
ocurre en mercados reales; sirven para explorar supuestos, no para predecir precios.
