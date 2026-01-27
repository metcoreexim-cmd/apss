import { motion } from "framer-motion";
import { Sparkles, Truck, Gift, Shield, Percent } from "lucide-react";

interface Announcement {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

interface AnnouncementTickerProps {
  announcements?: Announcement[];
}

const defaultAnnouncements: Announcement[] = [
  { id: "1", text: "Free Shipping on orders above ₹499", icon: <Truck className="w-4 h-4" /> },
  { id: "2", text: "Use code FIRST10 for 10% off", icon: <Percent className="w-4 h-4" /> },
  { id: "3", text: "Free Gift on orders above ₹999", icon: <Gift className="w-4 h-4" /> },
  { id: "4", text: "100% Secure Payments", icon: <Shield className="w-4 h-4" /> },
  { id: "5", text: "New Arrivals Every Week", icon: <Sparkles className="w-4 h-4" /> },
];

export function AnnouncementTicker({ announcements = defaultAnnouncements }: AnnouncementTickerProps) {
  // Duplicate announcements for seamless loop
  const duplicatedAnnouncements = [...announcements, ...announcements, ...announcements];

  return (
    <div className="relative bg-gradient-to-r from-primary via-primary to-primary overflow-hidden">
      {/* Animated background shimmer */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{ backgroundSize: "200% 100%" }}
      />

      <div className="py-2 relative">
        <motion.div
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {duplicatedAnnouncements.map((announcement, index) => (
            <div
              key={`${announcement.id}-${index}`}
              className="flex items-center gap-2 mx-8 text-primary-foreground"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                className="text-yellow-200"
              >
                {announcement.icon}
              </motion.span>
              <span className="text-sm font-medium tracking-wide">
                {announcement.text}
              </span>
              <span className="text-yellow-200 mx-4">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
