import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface BannerProps {
  image: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  className?: string;
}

export function Banner({ image, title, subtitle, linkUrl, className = "" }: BannerProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-xl overflow-hidden group cursor-pointer ${className}`}
    >
      <img
        src={image}
        alt={title || "Banner"}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {(title || subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent flex items-end p-6">
          <div>
            {title && (
              <h3 className="font-display text-xl md:text-2xl font-bold text-background mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-background/80 text-sm md:text-base">{subtitle}</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  if (linkUrl) {
    return <Link to={linkUrl}>{content}</Link>;
  }

  return content;
}

interface MidBannerRowProps {
  banners: {
    id: string;
    image: string;
    title?: string;
    subtitle?: string;
    linkUrl?: string;
  }[];
}

export function MidBannerRow({ banners }: MidBannerRowProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.slice(0, 3).map((banner) => (
            <Banner
              key={banner.id}
              image={banner.image}
              title={banner.title}
              subtitle={banner.subtitle}
              linkUrl={banner.linkUrl}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FullWidthBanner({ image, title, subtitle, linkUrl }: BannerProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <Banner
          image={image}
          title={title}
          subtitle={subtitle}
          linkUrl={linkUrl}
          className="aspect-[4/1] md:aspect-[5/1]"
        />
      </div>
    </section>
  );
}
