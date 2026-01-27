import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Sparkles, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
}

export function NewsletterSection({
  title = "Join Our Newsletter",
  subtitle = "Subscribe to get exclusive offers, new arrivals & insider-only discounts",
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thank you for subscribing!");
    setEmail("");
    setIsLoading(false);
    setIsSubscribed(true);
  };

  const benefits = [
    "Exclusive deals & offers",
    "New product alerts",
    "10% off your first order",
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white rounded-full blur-3xl"
        />
        
        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          >
            <Sparkles className="w-6 h-6 text-white/30" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 mb-8 shadow-2xl"
            >
              <Gift className="h-10 w-10 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
              {subtitle}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Form */}
            {!isSubscribed ? (
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 rounded-xl bg-white border-0 text-foreground placeholder:text-muted-foreground text-base shadow-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full"
                    />
                  ) : (
                    <>
                      Subscribe
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're In!</h3>
                <p className="text-white/80">
                  Check your inbox for a special welcome gift 🎁
                </p>
              </motion.div>
            )}

            {/* Disclaimer */}
            {!isSubscribed && (
              <p className="text-xs text-white/60 mt-6">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
                <br />
                Unsubscribe anytime.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
