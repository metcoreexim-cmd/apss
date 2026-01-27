import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones, CreditCard, Package } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On orders above ₹499",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Payment",
    description: "100% secure checkout",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: "Easy Returns",
    description: "7-day return policy",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "24/7 Support",
    description: "Dedicated assistance",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "COD Available",
    description: "Cash on delivery",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: "Quality Assured",
    description: "100% genuine products",
    gradient: "from-indigo-500 to-blue-500",
  },
];

interface FeaturesStripProps {
  features?: Feature[];
}

export function FeaturesStrip({ features = defaultFeatures }: FeaturesStripProps) {
  return (
    <section className="py-10 bg-gradient-to-r from-primary/5 via-background to-accent/5 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon with gradient */}
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}
              >
                {feature.icon}
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
              </motion.div>
              
              <div className="relative">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
