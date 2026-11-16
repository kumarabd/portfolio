import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSeries, formatDate, getSeries } from "@/lib/blog";

type Props = { params: Promise<{ series: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => allSeries().map((s) => ({ series: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSeries((await params).series);
  return { title: s ? `${s.title} — Abishek Kumar` : "Writing" };
}

export default async function SeriesPage({ params }: Props) {
  const s = getSeries((await params).series);
  if (!s) notFound();
  return (
    <main className="doc">
      <Link href="/blog" className="back-link">&larr; All writing</Link>
      <h1>{s.title}</h1>
      <p className="lede">{s.summary}</p>
      <ol className="post-list roomy">
        {s.posts.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/blog/${s.slug}/${p.slug}`}>
              <span className="n">{i + 1}</span>
              <span className="t">{p.title}<small>{p.summary}</small></span>
              <span className="m">{formatDate(p.date)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
