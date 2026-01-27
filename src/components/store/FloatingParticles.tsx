import { motion } from "framer-motion";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
}

export function FloatingParticles({ count = 20, color = "primary" }: FloatingParticlesProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            y: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
          className={`absolute w-2 h-2 rounded-full bg-${color}/20`}
          style={{
            background: `radial-gradient(circle, hsl(var(--${color})) 0%, transparent 70%)`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
