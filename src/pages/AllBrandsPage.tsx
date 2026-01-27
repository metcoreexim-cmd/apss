import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

type BrandRow = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean | null
}

export default function AllBrandsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["brands-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id,name,slug,logo_url,is_active")
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) throw error
      return (data || []) as BrandRow[]
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Brands</h1>
          <p className="mt-2 text-muted-foreground">Browse brands available in APSS</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data?.map((b) => (
            <Link
              key={b.id}
              to={`/brand/${b.slug}`}
              className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl border bg-background p-2">
                  <img
                    src={b.logo_url || "/images/brand-placeholder.png"}
                    alt={b.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = "/images/brand-placeholder.png"
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold group-hover:underline">{b.name}</div>
                  <div className="text-xs text-muted-foreground">View products</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
