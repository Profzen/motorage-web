import { TrendingUp, Users, MapPin } from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Étudiants inscrits",
    icon: Users,
  },
  {
    value: "1200+",
    label: "Trajets partagés",
    icon: MapPin,
  },
  {
    value: "2500+",
    label: "Dépannages réussis",
    icon: TrendingUp,
  },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5 border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
