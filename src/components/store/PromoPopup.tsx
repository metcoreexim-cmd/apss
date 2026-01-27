import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const POPUP_STORAGE_KEY = "promo_popup_shown";
const POPUP_DELAY = 2000; // Show after 2 seconds

interface PromoPopupProps {
  discountCode?: string;
  discountPercent?: number;
  title?: string;
  subtitle?: string;
}

export function PromoPopup({
  discountCode = "WELCOME10",
  discountPercent = 10,
  title = "Welcome to AppsStore!",
  subtitle = "Get exclusive deals on your first order",
}: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    // Check if popup was already shown
    const wasShown = localStorage.getItem(POPUP_STORAGE_KEY);
    
    if (!wasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, POPUP_DELAY);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(POPUP_STORAGE_KEY, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setHasSubscribed(true);
    setIsSubmitting(false);
    toast.success("You're in! Check your email for the discount code.");
    
    // Auto close after showing success
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(discountCode);
    toast.success("Discount code copied!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative header */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 py-8 text-primary-foreground">
                {/* Sparkle decorations */}
                <Sparkles className="absolute top-4 left-4 w-6 h-6 opacity-50 animate-pulse" />
                <Sparkles className="absolute bottom-4 right-8 w-4 h-4 opacity-40 animate-pulse" />
                
                <div className="text-center">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-block mb-3"
                  >
                    <Gift className="w-12 h-12 mx-auto" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold mb-1">{title}</h2>
                  <p className="text-primary-foreground/80">{subtitle}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!hasSubscribed ? (
                  <>
                    {/* Discount highlight */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-2xl">
                        <span>{discountPercent}% OFF</span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">
                        on your first order
                      </p>
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-center"
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          />
                        ) : (
                          "Get My Discount"
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By subscribing, you agree to receive marketing emails.
                      <br />
                      Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path d="M5 12l5 5L20 7" />
                      </motion.svg>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Use this code at checkout:
                    </p>
                    
                    <button
                      onClick={copyCode}
                      className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-lg font-mono font-bold text-lg hover:bg-muted/80 transition-colors"
                    >
                      {discountCode}
                      <span className="text-xs text-muted-foreground">
                        (tap to copy)
                      </span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Skip link */}
              {!hasSubscribed && (
                <div className="px-6 pb-6 text-center">
                  <button
                    onClick={handleClose}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                  >
                    No thanks, I'll pay full price
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
