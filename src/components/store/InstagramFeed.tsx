import { motion } from "framer-motion";
import { Instagram, Play, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface InstagramPost {
  id: string;
  thumbnail: string;
  isVideo: boolean;
  productId?: string;
  productSlug?: string;
  productTitle?: string;
  likes: number;
}

interface InstagramFeedProps {
  posts?: InstagramPost[];
  className?: string;
}

// Mock data for demonstration
const mockPosts: InstagramPost[] = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80",
    isVideo: true,
    productSlug: "colorful-notebooks",
    productTitle: "Colorful Notebooks Set",
    likes: 1243,
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80",
    isVideo: false,
    productSlug: "premium-pens",
    productTitle: "Premium Pen Collection",
    likes: 892,
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    isVideo: true,
    productSlug: "desk-organizer",
    productTitle: "Wooden Desk Organizer",
    likes: 2156,
  },
  {
    id: "4",
    thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    isVideo: false,
    productSlug: "washi-tapes",
    productTitle: "Decorative Washi Tapes",
    likes: 1567,
  },
  {
    id: "5",
    thumbnail: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80",
    isVideo: true,
    productSlug: "planner-2024",
    productTitle: "2024 Daily Planner",
    likes: 3421,
  },
  {
    id: "6",
    thumbnail: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
    isVideo: false,
    productSlug: "art-supplies",
    productTitle: "Art Supplies Kit",
    likes: 987,
  },
];

export function InstagramFeed({ posts = mockPosts, className }: InstagramFeedProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className={cn("py-12 bg-secondary/30", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">Shop The Look</h2>
          </div>
          <p className="text-muted-foreground">
            Get inspired by our Instagram community • @apssstore
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Thumbnail */}
              <img
                src={post.thumbnail}
                alt={post.productTitle || "Instagram post"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Video indicator */}
              {post.isVideo && (
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
                  <Play className="w-3.5 h-3.5 fill-current text-foreground" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                {/* Likes */}
                <div className="flex items-center gap-1 text-white text-sm mb-2">
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{post.likes.toLocaleString()}</span>
                </div>

                {/* Shop button */}
                {post.productSlug && (
                  <Link
                    to={`/product/${post.productSlug}`}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop Now
                  </Link>
                )}
              </div>

              {/* Product tag indicator */}
              {post.productSlug && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-100 group-hover:opacity-0 transition-opacity">
                  <ShoppingBag className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="https://www.instagram.com/ammanpaperstoreandstationery?igsh=bjk2a2xzdG5nYWRy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Instagram className="w-5 h-5" />
            Follow Us on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
