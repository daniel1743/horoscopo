import { ZODIAC_SIGNS } from "@/types/astrology";
import type { NatalAngle, NatalChart } from "@/types/astrology";

interface Props {
  chart: NatalChart;
}

const CENTER = 200;
const OUTER_RADIUS = 172;
const INNER_RADIUS = 118;
const PLANET_RADIUS = 142;

function pointAt(longitude: number, radius: number): { x: number; y: number } {
  const angle = ((longitude - 90) * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function linePoint(longitude: number, radius: number): string {
  const point = pointAt(longitude, radius);
  return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
}

function angleColor(angle: NatalAngle["key"]): string {
  if (angle === "ascendant" || angle === "descendant") return "#6c4bd9";
  return "#b96f91";
}

export function NatalChartWheel({ chart }: Props) {
  return (
    <section aria-labelledby="natal-wheel-title" className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="natal-wheel-title" className="font-display text-[20px] text-ink">
          Rueda natal de referencia
        </h3>
        <span className="text-xs text-ink-muted">Tropical · casas iguales</span>
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line/70 bg-background p-3 sm:p-5">
        <svg
          viewBox="0 0 400 400"
          role="img"
          aria-labelledby="natal-wheel-title natal-wheel-description"
          className="mx-auto block h-auto w-full min-w-[320px] max-w-[520px]"
        >
          <desc id="natal-wheel-description">
            Rueda natal con los doce signos, doce cúspides de casas, diez cuerpos celestes y cuatro
            ángulos principales.
          </desc>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1.5"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="1"
          />
          {ZODIAC_SIGNS.map((sign, index) => {
            const longitude = index * 30;
            const boundary = pointAt(longitude, OUTER_RADIUS);
            const label = pointAt(longitude + 15, OUTER_RADIUS - 18);
            return (
              <g key={sign.key}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={boundary.x}
                  y2={boundary.y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-current text-[15px] text-ink-muted"
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}
          {chart.houses.map((house) => (
            <line
              key={`house-${house.house}`}
              x1={CENTER}
              y1={CENTER}
              x2={pointAt(house.longitude, INNER_RADIUS).x}
              y2={pointAt(house.longitude, INNER_RADIUS).y}
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth={house.house === 1 || house.house === 10 ? 1.8 : 0.8}
            />
          ))}
          {chart.angles.map((angle) => (
            <line
              key={angle.key}
              x1={CENTER}
              y1={CENTER}
              x2={pointAt(angle.longitude, OUTER_RADIUS).x}
              y2={pointAt(angle.longitude, OUTER_RADIUS).y}
              stroke={angleColor(angle.key)}
              strokeOpacity="0.68"
              strokeWidth="1.5"
              strokeDasharray={angle.key === "ascendant" || angle.key === "mc" ? undefined : "4 3"}
            />
          ))}
          {chart.placements.map((placement) => {
            const point = pointAt(placement.longitude, PLANET_RADIUS);
            return (
              <g key={placement.body}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  className="fill-cosmic stroke-background"
                  strokeWidth="2"
                />
                <text
                  x={point.x}
                  y={point.y - 8}
                  textAnchor="middle"
                  className="fill-current text-[9px] font-medium text-ink"
                >
                  {placement.label.slice(0, 3)}
                </text>
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r="3" className="fill-cosmic" />
          <text
            x={CENTER}
            y={CENTER + 18}
            textAnchor="middle"
            className="fill-current text-[9px] text-ink-muted"
          >
            casas
          </text>
        </svg>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        La rueda resume los mismos datos que las tablas. En pantallas pequeñas puedes desplazarla
        horizontalmente; los nombres completos y los grados permanecen disponibles abajo.
      </p>
    </section>
  );
}
