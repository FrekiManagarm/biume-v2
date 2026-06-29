"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  Users,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@biume/ui/lib/utils";

const features = [
  {
    id: "ai",
    title: "Intelligence Artificielle",
    description:
      "L'IA analyse vos observations en temps réel, reformule vos comptes-rendus en langage professionnel et suggère des plans de traitement basés sur l'historique.",
    icon: BrainCircuit,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    span: "md:col-span-2",
  },
  {
    id: "reports",
    title: "Rapports Automatisés",
    description:
      "Générez des rapports PDF impeccables en un clic. Personnalisez vos modèles, ajoutez votre logo et laissez Biume gérer la mise en page.",
    icon: FileText,
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    span: "",
  },
  {
    id: "management",
    title: "Suivi Patient 360°",
    description:
      "Accédez à l'historique complet de chaque animal : consultations, courbes de poids, documents et échanges avec les propriétaires.",
    icon: Users,
    gradient: "from-orange-500/10 to-amber-500/10",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    span: "",
  },
  {
    id: "agenda",
    title: "Agenda & Tournées",
    description:
      "Synchronisez votre agenda et calculez intelligemment vos itinéraires pour réduire vos temps de trajet et frais kilométriques.",
    icon: CalendarCheck,
    gradient: "from-emerald-500/10 to-green-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    span: "md:col-span-2",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/3 rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/6 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Plateforme tout-en-un
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Conçu pour votre{" "}
            <span className="text-primary">tranquillité d&apos;esprit</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Libérez-vous des tâches administratives et concentrez-vous sur ce
            qui compte vraiment : le soin des animaux.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              className={cn(
                "group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-7 md:p-8 transition-all duration-300 hover:border-border/60 hover:shadow-lg hover:shadow-black/2 dark:hover:shadow-black/10 hover:-translate-y-0.5",
                feature.span,
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
                  feature.gradient,
                )}
              />

              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105",
                  feature.iconBg,
                )}
              >
                <feature.icon className={cn("w-5 h-5", feature.iconColor)} />
              </div>

              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
