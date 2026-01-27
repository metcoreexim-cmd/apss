import { Link } from "react-router-dom";

export default function StaticPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="container mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
      ) : null}

      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex px-5 py-2 rounded-xl bg-black text-white hover:opacity-90 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
