// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-neutral-400 text-sm mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-white text-black rounded text-sm font-medium hover:bg-neutral-200 transition"
      >
        Return Home
      </Link>
    </main>
  );
}