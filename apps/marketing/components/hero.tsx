"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@biume/ui/components/button";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Languages, Star, Zap } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
    >
      {/* --- Background --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[5%] left-[10%] w-150 h-150 bg-primary/[0.07] rounded-full blur-[140px]" />
        <div className="absolute top-[15%] right-[5%] w-125 h-125 bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] w-100 h-100 bg-primary/4 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.08) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* --- Text Content --- */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-7 mb-16 md:mb-20">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/6 border border-primary/10 text-primary text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            L&apos;IA au service de la santé animale
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.1] text-balance"
          >
            Vos rapports,{" "}
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                simplifiés par l&apos;IA
              </span>
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-3"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 9C60 3 120 3 160 6C200 9 250 5 298 7"
                  stroke="hsl(148 71% 45% / 0.35)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Biume génère des comptes rendus professionnels, analyse
            l&apos;historique de vos patients et vulgarise vos diagnostics —
            pour que vous puissiez vous concentrer sur le soin.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Button
              size="lg"
              className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              render={
                <Link href="/sign-up">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full h-12 px-8 text-base group"
              render={
                <Link
                  href="https://cal.com/mathieu-chambaud-biume"
                  target="_blank"
                >
                  <span className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center mr-2 group-hover:bg-primary/10 transition-colors">
                    <Play className="w-3 h-3 fill-foreground ml-0.5" />
                  </span>
                  Voir la démo
                </Link>
              }
            />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="ml-1.5 font-medium">4.9/5</span>
            </div>
            <span className="w-px h-4 bg-border hidden sm:block" />
            <span>Essai gratuit 15 jours</span>
            <span className="w-px h-4 bg-border hidden sm:block" />
            <span className="hidden sm:block">Sans carte bancaire</span>
          </motion.div>
        </div>

        {/* --- Product Mockup: Vulgarisation avant/après --- */}
        <motion.div style={{ y: mockupY, opacity: mockupOpacity }}>
          <div className="relative mx-auto max-w-4xl px-4 md:px-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div className="relative flex flex-col items-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 min-h-85 md:min-h-95">
                {/* Carte "Avant" — jargon médical */}
                <motion.div
                  initial={{ opacity: 0, x: -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full md:w-[42%] max-w-sm"
                >
                  <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-6 shadow-xl shadow-black/5 dark:shadow-black/15">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Avant
                      </span>
                      <span className="h-px flex-1 bg-border/50" />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 font-medium">
                      Dysfonction somatique T12-L1, restriction de mobilité
                      vertébrale. Hypomobilité sacro-iliaque droite.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Langage professionnel
                    </p>
                  </div>
                </motion.div>

                {/* Flèche / transformation animée */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <motion.span
                    className="text-[10px] font-semibold uppercase tracking-wider text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Vulgarisation IA
                  </motion.span>
                </motion.div>

                {/* Carte "Après" — langage client */}
                <motion.div
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full md:w-[42%] max-w-sm"
                >
                  <div className="rounded-2xl border border-secondary/30 bg-card/90 backdrop-blur-xl p-6 shadow-xl shadow-secondary/5 dark:shadow-secondary/5 ring-1 ring-secondary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Languages className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                        Pour le propriétaire
                      </span>
                      <span className="h-px flex-1 bg-secondary/20" />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      Blocage au niveau du dos (vertèbres T12-L1). Articulation
                      bassin droite un peu figée.
                    </p>
                    <p className="text-xs text-secondary font-medium mt-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      Compréhensible par tous
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">
                    En un clic dans vos rapports
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
