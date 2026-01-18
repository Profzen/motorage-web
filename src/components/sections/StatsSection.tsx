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
    <section className="from-primary/5 to-secondary/5 border-y bg-linear-to-r py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110">
                  <Icon className="text-primary h-7 w-7" />
                </div>
                <div className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
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
