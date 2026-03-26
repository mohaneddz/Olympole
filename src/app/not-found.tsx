import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-foreground/70 mb-6">The page you requested was not found.</p>
      <Link href="/" className="text-primary">Back to home</Link>
    </div>
  );
}
