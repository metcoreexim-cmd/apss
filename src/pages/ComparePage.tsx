import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingCart, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCompare, CompareProduct } from "@/hooks/useCompare";
import { useCart } from "@/hooks/useCart";
import { StoreLayout } from "@/components/layout/StoreLayout";

export default function ComparePage() {
  const navigate = useNavigate();
  const { products, removeProduct, clearAll } = useCompare();
  const { addItem } = useCart();

  const handleAddToCart = (product: CompareProduct) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
      image: product.image,
    });
  };

  if (products.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No Products to Compare</h1>
          <p className="text-muted-foreground mb-6">
            Add products to compare by clicking the compare button on product cards.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const comparisonRows = [
    {
      label: "Price",
      render: (p: CompareProduct) => (
        <div>
          <span className="text-xl font-bold text-primary">
            ₹{p.price.toLocaleString()}
          </span>
          {p.mrp > p.price && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              ₹{p.mrp.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Discount",
      render: (p: CompareProduct) => {
        const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        return discount > 0 ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {discount}% OFF
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      label: "Rating",
      render: (p: CompareProduct) =>
        p.rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{p.rating.toFixed(1)}</span>
            {p.ratingCount && (
              <span className="text-sm text-muted-foreground">
                ({p.ratingCount})
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">No ratings</span>
        ),
    },
    {
      label: "Availability",
      render: (p: CompareProduct) =>
        p.stock && p.stock > 0 ? (
          <Badge variant="outline" className="text-green-600 border-green-600">
            In Stock ({p.stock})
          </Badge>
        ) : (
          <Badge variant="destructive">Out of Stock</Badge>
        ),
    },
    {
      label: "Brand",
      render: (p: CompareProduct) => (
        <span>{p.brand || "-"}</span>
      ),
    },
    {
      label: "Category",
      render: (p: CompareProduct) => (
        <span>{p.category || "-"}</span>
      ),
    },
    {
      label: "SKU",
      render: (p: CompareProduct) => (
        <span className="text-sm font-mono">{p.sku || "-"}</span>
      ),
    },
  ];

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Compare Products</h1>
            <p className="text-muted-foreground">
              Comparing {products.length} product{products.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Product Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}>
              <div className="p-4" />
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-4 bg-card rounded-xl border"
                >
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-secondary/30">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  <Button
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock || product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>
              ))}

              {/* Add More Slot */}
              {products.length < 3 && (
                <div className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="text-sm text-center">
                    Add more products to compare
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Comparison Rows */}
            {comparisonRows.map((row, index) => (
              <div
                key={row.label}
                className="grid gap-4 py-4 border-b last:border-0"
                style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}
              >
                <div className="font-medium text-muted-foreground flex items-center">
                  {row.label}
                </div>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center"
                  >
                    {row.render(product)}
                  </motion.div>
                ))}
                {products.length < 3 && <div />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
