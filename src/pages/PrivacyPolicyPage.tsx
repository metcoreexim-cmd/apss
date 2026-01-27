export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-card p-7 shadow-sm">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          We respect your privacy and protect your data.
        </p>

        <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            We collect customer details like name, phone, address and email only for order processing
            and delivery purposes.
          </p>
          <p>
            Payment details are handled securely by payment providers. We do not store card details.
          </p>
          <p>
            We never sell or share your personal data with third parties except delivery partners
            required for shipment.
          </p>
        </div>
      </div>
    </div>
  )
}
