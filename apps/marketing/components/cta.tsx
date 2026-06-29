"use client";

import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@biume/ui/components/button";
import Link from "next/link";
import { motion } from "framer-motion";

const benefits = [
  "Essai gratuit de 15 jours",
  "Formation personnalisée incluse",
  "Support dédié 7j/7",
  "Migration de vos données offerte",
];

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-primary/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-secondary/4 rounded-full blur-[120px]" />
      </div>

      <div className="container px-4 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/6 border border-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Prêt à démarrer ?
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Transformez votre activité{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              dès aujourd&apos;hui
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez les professionnels qui font confiance à Biume pour gérer
            leur activité au quotidien.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-xl shadow-xl shadow-black/2 dark:shadow-black/10 p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-primary/3 to-transparent pointer-events-none" />

          <div className="relative grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Lancez-vous sans risque
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Testez toutes les fonctionnalités pendant 15 jours, sans carte
                bancaire. Notre équipe vous accompagne à chaque étape.
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="rounded-full shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  render={
                    <Link href="/sign-up">
                      Commencer gratuitement
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  }
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  render={
                    <Link
                      href="https://cal.com/mathieu-chambaud-biume"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demander une démo
                    </Link>
                  }
                />
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative">
              <div className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-lg p-7 md:p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <blockquote className="text-base md:text-lg mb-6 leading-relaxed italic text-foreground/90">
                  &quot;Biume a révolutionné ma pratique. Je gagne 2 heures par
                  jour sur l&apos;administratif et mes clients adorent la clarté
                  de mes rapports.&quot;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-sm font-bold">MC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Marie C.</p>
                    <p className="text-xs text-muted-foreground">
                      Ostéopathe équin, Paris
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 px-4 py-2 rounded-full bg-card border border-border/50 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold">98% satisfait</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
