import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

interface BudgetTier {
  id: string;
  label: string;
  amount: number;
  image?: string;
  bgColor?: string;
  link: string;
  emoji?: string;
}

interface BudgetPicksProps {
  title?: string;
  subtitle?: string;
  tiers?: BudgetTier[];
}

const defaultTiers: BudgetTier[] = [
  {
    id: "under-99",
    label: "Under",
    amount: 99,
    bgColor: "from-pink-500 via-rose-500 to-red-500",
    link: "/deals?max=99",
    emoji: "🎯",
  },
  {
    id: "under-199",
    label: "Under",
    amount: 199,
    bgColor: "from-orange-500 via-amber-500 to-yellow-500",
    link: "/deals?max=199",
    emoji: "⚡",
  },
  {
    id: "under-299",
    label: "Under",
    amount: 299,
    bgColor: "from-green-500 via-emerald-500 to-teal-500",
    link: "/deals?max=299",
    emoji: "💚",
  },
  {
    id: "under-499",
    label: "Under",
    amount: 499,
    bgColor: "from-blue-500 via-indigo-500 to-purple-500",
    link: "/deals?max=499",
    emoji: "💎",
  },
];

export function BudgetPicks({
  title = "Great Picks Under Budget",
  subtitle = "Affordable Inspiration Awaits",
  tiers = defaultTiers,
}: BudgetPicksProps) {
  return (
    <section className="py-16 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Budget Friendly</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-3 text-lg">{subtitle}</p>
          )}
        </motion.div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link
                to={tier.link}
                className="block group"
              >
                <div
                  className={`relative aspect-square rounded-3xl bg-gradient-to-br ${tier.bgColor} overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-black/10 rounded-full blur-2xl" />
                  
                  {/* Grid pattern overlay */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  
                  {tier.image && (
                    <img
                      src={tier.image}
                      alt={`Under ₹${tier.amount}`}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  
                  {/* Emoji badge */}
                  <div className="absolute top-4 right-4 text-2xl opacity-80">
                    {tier.emoji}
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <span className="text-sm md:text-base font-medium opacity-90 uppercase tracking-wider">
                      {tier.label}
                    </span>
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl md:text-6xl font-display font-bold drop-shadow-lg"
                    >
                      ₹{tier.amount}
                    </motion.span>
                    
                    {/* Shop now indicator */}
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">Shop Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
