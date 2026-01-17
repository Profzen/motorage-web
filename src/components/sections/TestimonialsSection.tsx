import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amara K.",
    role: "Étudiante, année 2",
    message: "Grâce à Miyi Ðekae, j'ai trouvé un trajet en 5 minutes. C'est tellement pratique !",
    rating: 5,
  },
  {
    name: "Kofi M.",
    role: "Étudiant, année 3",
    message: "Une super communauté. J'ai pu aider plusieurs camarades avec ma moto. Fier de contribuer !",
    rating: 5,
  },
  {
    name: "Awa D.",
    role: "Étudiante, année 1",
    message: "Pas besoin de taxi coûteux. Miyi Ðekae m'a sauvé la vie académique plusieurs fois.",
    rating: 5,
  },
  {
    name: "Tunde O.",
    role: "Étudiant, année 4",
    message: "L'app est intuitive et la communauté est vraiment accueillante. Hautement recommandée !",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ce que dit notre communauté
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Les retours authentiques de nos utilisateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">
                  &quot;{testimonial.message}&quot;
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
