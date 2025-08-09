import React from "react";
import { motion, Variants } from "framer-motion";
import { Code, Palette, Rocket, Target } from "lucide-react";
import { TOKENS } from "../../utils/tokens";

export const Process: React.FC = () => {
  const steps = [
    {
      icon: Target,
      title: "Discovery",
      desc: "Clarify goals, users, KPIs, and constraints.",
      gradient: "from-pink-500 via-red-500 to-orange-500",
    },
    {
      icon: Palette,
      title: "Design",
      desc: "Wireframes, UI kit, and flows.",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
    },
    {
      icon: Code,
      title: "Build",
      desc: "Implement, test, iterate fast.",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      icon: Rocket,
      title: "Launch",
      desc: "Ship, monitor, optimize.",
      gradient: "from-amber-500 via-yellow-500 to-lime-500",
    },
  ];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      {/* Heading */}
      <div className="text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-4xl font-bold tracking-tight ${TOKENS.textHeading} sm:text-5xl`}
        >
          Our Process
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className={`${TOKENS.textBody} mt-4 text-lg max-w-2xl mx-auto`}
        >
          We follow a proven four-step journey from idea to impactful launch.
        </motion.p>
      </div>

      {/* Steps */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step, i) => (
          <motion.div
            key={i}
            variants={card}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { duration: 0.3 },
            }}
            className="group relative rounded-2xl bg-white dark:bg-slate-800 shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Icon header */}
            <div
              className={`h-28 bg-gradient-to-r ${step.gradient} flex items-center justify-center`}
            >
              <step.icon className="h-10 w-10 text-white" />
            </div>

            {/* Text */}
            <div className="p-6">
              <h3
                className={`text-xl font-semibold mb-2 ${TOKENS.textHeading}`}
              >
                {i + 1}. {step.title}
              </h3>
              <p
                className={`${TOKENS.textBody} text-sm leading-relaxed text-slate-600 dark:text-slate-300`}
              >
                {step.desc}
              </p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none from-slate-900 to-transparent" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
