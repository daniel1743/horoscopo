import { Activity, Star, Moon as MoonIcon, Search } from "lucide-react";

export function AstralActivity() {
  const mockActivities = [
    {
      id: 1,
      icon: <MoonIcon className="w-4 h-4 text-brand" />,
      text: "Consultaste tu Luna de hoy",
      time: "Hace 2 horas",
    },
    {
      id: 2,
      icon: <Star className="w-4 h-4 text-amber-500" />,
      text: "Guardaste una lectura de Tarot",
      time: "Ayer",
    },
    {
      id: 3,
      icon: <Search className="w-4 h-4 text-primary" />,
      text: "Descubriste un nuevo tránsito importante",
      time: "Hace 3 días",
    },
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-line-subtle">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-ink-muted" />
        <h2 className="font-display text-lg font-semibold text-ink">Tu actividad astral</h2>
      </div>
      
      <div className="space-y-4 ml-2 border-l-2 border-line-subtle pl-4 pb-2">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[25px] top-1 bg-sand-light rounded-full p-0.5">
              <div className="bg-white rounded-full p-1 shadow-sm border border-line-subtle">
                {activity.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-ink">{activity.text}</p>
            <p className="text-xs text-ink-muted mt-0.5">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
