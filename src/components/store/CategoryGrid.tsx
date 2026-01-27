import { Link } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image_url?: string | null;
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories?.length) return null;

  return (
    <section className="py-10 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">
              Explore all stationery essentials
            </p>
          </div>

          <Link
            to="/categories"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group rounded-2xl border bg-card hover:shadow-md transition overflow-hidden"
            >
              <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                  />
                ) : (
                  <div className="text-3xl">{cat.icon || "📦"}</div>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium line-clamp-1">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse items →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
