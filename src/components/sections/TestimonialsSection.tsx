import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amara K.",
    role: "Étudiante, année 2",
    message:
      "Grâce à Miyi Ðekae, j'ai trouvé un trajet en 5 minutes. C'est tellement pratique !",
    rating: 5,
  },
  {
    name: "Kofi M.",
    role: "Étudiant, année 3",
    message:
      "Une super communauté. J'ai pu aider plusieurs camarades avec mon véhicule. Fier de contribuer !",
    rating: 5,
  },
  {
    name: "Awa D.",
    role: "Étudiante, année 1",
    message:
      "Pas besoin de taxi coûteux. Miyi Ðekae m'a sauvé la vie académique plusieurs fois.",
    rating: 5,
  },
  {
    name: "Tunde O.",
    role: "Étudiant, année 4",
    message:
      "L'app est intuitive et la communauté est vraiment accueillante. Hautement recommandée !",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-surface py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ce que dit notre communauté
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Les retours authentiques de nos utilisateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border-none shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-secondary text-secondary h-4 w-4"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm italic">
                  &ldquo;{testimonial.message}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-primary text-xs font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
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
