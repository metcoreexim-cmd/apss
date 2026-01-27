export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-card p-7 shadow-sm">
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="mt-2 text-muted-foreground">
          Please read before using our website.
        </p>

        <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>By placing an order, you agree to our pricing, delivery, and return conditions.</p>
          <p>Product images are for representation. Actual product may slightly vary.</p>
          <p>We may update policies anytime without prior notice.</p>
        </div>
      </div>
    </div>
  )
}
