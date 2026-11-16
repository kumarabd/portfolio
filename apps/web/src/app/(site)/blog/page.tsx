import type { Metadata } from "next";
import Link from "next/link";
import { allSeries } from "@/lib/blog";

export const metadata: Metadata = { title: "Writing — Abishek Kumar" };

export default function BlogIndex() {
  const series = allSeries();
  return (
    <main className="doc">
      <Link href="/#writing" className="back-link">&larr; Back to the map</Link>
      <h1>Writing</h1>
      <p className="lede">Posts grouped into series. Each series goes deep on one topic.</p>
      {series.length === 0 && <p className="lede">Nothing published yet.</p>}
      {series.map((s) => (
        <section key={s.slug} className="series">
          <h2><Link href={`/blog/${s.slug}`}>{s.title}</Link></h2>
          <p>{s.summary}</p>
          <ol className="post-list">
            {s.posts.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/blog/${s.slug}/${p.slug}`}>
                  <span className="n">{i + 1}</span>
                  <span className="t">{p.title}</span>
                  <span className="m">{p.minutes} min</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
