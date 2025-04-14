import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { getLegalDocs } from '@/app/legal/utils';

// Only params that are generated at build time will be used
export const dynamicParams = false;

export function generateStaticParams() {
  const docs = getLegalDocs();

  return docs.map(doc => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDocs().find(doc => doc.slug === slug);
  if (!doc) {
    return;
  }

  const { title, publishedAt: publishedTime, summary: description } = doc.metadata;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://sappy.lol/legal/${doc.slug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  } satisfies Metadata;
}

export default async function Doc({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDocs().find(doc => doc.slug === slug);

  if (!doc) {
    notFound();
  }

  const headerStore = await headers();
  const nonce = headerStore.get('x-nonce') ?? undefined;

  return (
    <section className="flex w-full flex-col items-center p-5">
      <Script
        id={`legal-doc-${doc.slug}`}
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Legislation',
            name: doc.metadata.title,
            datePublished: doc.metadata.publishedAt,
            dateModified: doc.metadata.publishedAt,
            description: doc.metadata.summary,
            url: `https://sappy.lol/legal/${doc.slug}`,
            publisher: {
              '@type': 'Organization',
              name: 'Sappy Brands LLC',
              url: 'https://sappy.lol',
              logo: 'https://sappy.lol/icon.png',
            },
          }),
        }}
      />
      <article className="prose dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{doc.content}</ReactMarkdown>
      </article>
    </section>
  );
}
