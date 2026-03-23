import SlugPageClient from "./SlugPageClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface SlugPageProps {
  params: { slug?: string[] };
}

export default function SlugPage({ params }: SlugPageProps) {
  const slug = params.slug ?? [];
  const [namespace] = slug;

  // Restrict catch-all route to intentional search namespaces only.
  // Any other unknown route should show the global 404 page.
  const validNamespace = namespace === "attractions" || namespace === "locations";
  if (slug.length < 2 || !validNamespace) {
    notFound();
  }

  return <SlugPageClient slug={slug} />;
}
