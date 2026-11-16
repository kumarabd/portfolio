import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSeries, getPost } from "@/lib/blog";

type Props = { params: Promise<{ series: string; post: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => allSeries().flatMap((s) => s.posts.map((p) => ({ series: s.slug, post: p.slug })));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series, post } = await params;
  const found = getPost(series, post);
  return found ? { title: `${found.post.title} — Abishek Kumar`, description: found.post.summary } : { title: "Writing" };
}

export default async function PostPage({ params }: Props) {
  const { series, post } = await params;
  const found = getPost(series, post);
  if (!found) notFound();
  const { series: s, post: p, index, prev, next, html } = found;
  return (
    <main className="doc">
      <Link href={`/blog/${s.slug}`} className="back-link">&larr; {s.title}</Link>
      <article>
        <h1>{p.title}</h1>
        <p className="meta">
          Part {index + 1} of {s.posts.length} · {p.when} · {p.minutes} min read
        </p>
        {p.verdict && (
          <p className="tldr">
            <b>In short</b> {p.verdict}
            {html.includes('id="verdict"') && <a href="#verdict">Full verdict &darr;</a>}
          </p>
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <nav className="pager" aria-label="In this series">
        {prev ? <Link href={`/blog/${s.slug}/${prev.slug}`} rel="prev"><span>Previous</span>{prev.title}</Link> : <span />}
        {next ? <Link href={`/blog/${s.slug}/${next.slug}`} rel="next" className="next"><span>Next</span>{next.title}</Link> : <span />}
      </nav>
    </main>
  );
}
