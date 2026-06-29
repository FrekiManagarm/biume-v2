"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@biume/ui/components/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@biume/ui/lib/utils";

const includedFeatures = [
  "Assistant IA illimité",
  "Rapports PDF personnalisés",
  "Clients & Patients illimités",
  "Agenda intelligent & Trajets",
  "Stockage documents médicaux",
  "Support prioritaire 7j/7",
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const monthlyPrice = 29.99;
  const annualPrice = 24.99;
  const displayPrice = isAnnual ? annualPrice : monthlyPrice;
  const savings = (monthlyPrice * 12 - annualPrice * 12).toFixed(0);

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/4 rounded-full blur-[140px]" />
      </div>

      <div className="container px-4 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Un tarif unique,{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              tout inclus
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Accédez à toutes les fonctionnalités sans limite.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="p-1 bg-muted/40 rounded-full border border-border/40 flex items-center gap-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                !isAnnual
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                isAnnual
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annuel
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-linear-to-b from-primary/6 via-transparent to-transparent blur-3xl -z-10 rounded-3xl" />

          <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/2 dark:shadow-black/10 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayPrice}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-5xl md:text-6xl font-bold tabular-nums"
                      >
                        {displayPrice}€
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-muted-foreground text-lg">/mois</span>
                  </div>
                  {isAnnual && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-green-600 dark:text-green-400 font-medium"
                    >
                      Vous économisez {savings}€ par an
                    </motion.p>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Une solution complète pour gérer votre activité de A à Z. Sans
                  frais cachés. Annulable à tout moment.
                </p>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full rounded-full h-12 text-base shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    render={
                      <Link href="/sign-up">
                        Commencer l&apos;essai gratuit (15j)
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    }
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Pas de carte bancaire requise
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Tout ce qui est inclus
                </p>
                {includedFeatures.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
