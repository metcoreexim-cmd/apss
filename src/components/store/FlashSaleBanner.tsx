import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FlashSaleBannerProps {
  endTime?: Date;
  title?: string;
  subtitle?: string;
  discount?: string;
  link?: string;
}

export function FlashSaleBanner({
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours from now
  title = "Flash Sale",
  subtitle = "Limited Time Only",
  discount = "Up to 70% OFF",
  link = "/deals",
}: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isUrgent, setIsUrgent] = useState(false);

  function calculateTimeLeft() {
    const difference = endTime.getTime() - Date.now();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      // Urgent when less than 1 hour left
      setIsUrgent(
        newTimeLeft.days === 0 &&
          newTimeLeft.hours === 0 &&
          newTimeLeft.minutes < 60
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const TimeBlock = ({
    value,
    label,
    index,
  }: {
    value: number;
    label: string;
    index: number;
  }) => (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center"
    >
      <motion.div
        key={value}
        initial={{ scale: 1.2, rotateX: -90 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative w-14 h-14 md:w-20 md:h-20 rounded-xl flex items-center justify-center font-display text-2xl md:text-4xl font-bold ${
          isUrgent
            ? "bg-destructive text-destructive-foreground"
            : "bg-background/20 backdrop-blur-sm text-white"
        } shadow-lg border border-white/20`}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </div>
        <span className="relative z-10">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-xs md:text-sm text-white/80 mt-2 uppercase tracking-wider font-medium">
        {label}
      </span>
    </motion.div>
  );

  const Separator = () => (
    <motion.div
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="text-3xl md:text-5xl font-bold text-white/60 mx-1 md:mx-2 self-start mt-3 md:mt-4"
    >
      :
    </motion.div>
  );

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      {/* Animated gradient background */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-0 ${
          isUrgent
            ? "bg-gradient-to-r from-destructive via-orange-500 to-destructive"
            : "bg-gradient-to-r from-primary via-purple-600 to-primary"
        }`}
        style={{ backgroundSize: "200% 100%" }}
      />

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
          >
            {i % 2 === 0 ? (
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-white/20" />
            ) : (
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-300/30" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightning bolts on edges */}
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block"
      >
        <Zap className="w-16 h-16 text-yellow-300 fill-yellow-300" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block"
      >
        <Zap className="w-16 h-16 text-yellow-300 fill-yellow-300" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <span className="text-sm md:text-base font-medium text-yellow-300 uppercase tracking-wider">
                {subtitle}
              </span>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
            </div>

            <motion.h2
              animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="font-display text-3xl md:text-5xl font-bold text-white mb-2"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl md:text-3xl font-bold text-yellow-300"
            >
              {discount}
            </motion.p>
          </motion.div>

          {/* Center: Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center"
          >
            <div className="flex items-center gap-1 md:gap-2 bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
              <Clock className="w-5 h-5 text-white/70 mr-2 hidden md:block" />
              <TimeBlock value={timeLeft.days} label="Days" index={0} />
              <Separator />
              <TimeBlock value={timeLeft.hours} label="Hours" index={1} />
              <Separator />
              <TimeBlock value={timeLeft.minutes} label="Mins" index={2} />
              <Separator />
              <TimeBlock value={timeLeft.seconds} label="Secs" index={3} />
            </div>
          </motion.div>

          {/* Right: CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to={link}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className={`group rounded-full px-8 py-6 text-lg font-bold shadow-2xl ${
                    isUrgent
                      ? "bg-white text-destructive hover:bg-yellow-100"
                      : "bg-white text-primary hover:bg-yellow-100"
                  }`}
                >
                  <motion.span
                    animate={isUrgent ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    Shop Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>

            {isUrgent && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-center text-sm text-yellow-300 mt-2 font-medium"
              >
                ⚠️ Hurry! Sale ending soon!
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom urgency bar when less than 1 hour */}
      <AnimatePresence>
        {isUrgent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-yellow-400 overflow-hidden"
          >
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="flex whitespace-nowrap py-1"
            >
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className="text-sm font-bold text-black/80 mx-8 flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" /> LAST CHANCE
                  <Flame className="w-4 h-4" /> SALE ENDING SOON
                </span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
