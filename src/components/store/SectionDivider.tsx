import { motion } from "framer-motion";

interface SectionDividerProps {
  variant?: "wave" | "gradient" | "dots";
}

export function SectionDivider({ variant = "gradient" }: SectionDividerProps) {
  if (variant === "wave") {
    return (
      <div className="relative h-16 overflow-hidden">
        <motion.div
          animate={{ x: [0, -100] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex"
          style={{ width: "200%" }}
        >
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="w-1/2 h-full fill-secondary"
          >
            <path d="M0,30 Q300,60 600,30 T1200,30 L1200,60 L0,60 Z" />
          </svg>
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className="w-1/2 h-full fill-secondary"
          >
            <path d="M0,30 Q300,60 600,30 T1200,30 L1200,60 L0,60 Z" />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="py-8 flex justify-center items-center gap-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className="w-2 h-2 rounded-full bg-primary/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-1 my-8">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
    </div>
  );
}
