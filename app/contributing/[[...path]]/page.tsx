import { useMemo } from "react";
import { getAllFilesFrontMatter, getFileBySlug } from "sentry-docs/mdx";
import { getMDXComponent } from 'mdx-bundler/client';
import Link from "next/link";
import { PageGrid } from "sentry-docs/components/pageGrid";
import { Header } from 'sentry-docs/components/header';
import { Navbar } from 'sentry-docs/components/navbar';
import { Sidebar } from 'sentry-docs/components/sidebar';
import { Note } from "sentry-docs/components/note";
import { PlatformContent } from "sentry-docs/components/platformContent";
import { Alert } from "sentry-docs/components/alert";
import { GitHubCTA } from "sentry-docs/components/githubCta";

export async function generateStaticParams() {
    const docs = await getAllFilesFrontMatter();
    return docs.map((doc) => ({ path: doc.slug.split('/').slice(1) }));
}

const MDXComponents = {
  Alert,
  Note,
  PageGrid,
  PlatformContent,
  a: Link,
  wrapper: ({ components, ...rest }) => {
    return <Layout {...rest} />;
  }
}

const Layout = ({children, frontMatter, docs, toc}) => {
  return (
    <>
      <div className="sidebar">
        <Header />

        <div
          className="d-md-flex flex-column align-items-stretch collapse navbar-collapse"
          id="sidebar"
        >
          <div className="toc">
            <div className="text-white p-3">
              <Sidebar docs={docs} />
            </div>
          </div>
        </div>
        <div className="d-sm-none d-block" id="navbar-menu"></div>
      </div>
      <main role="main" className="px-0">
        <div className="flex-grow-1">
          <div className="d-block navbar-right-half">
            <Navbar />
          </div>

          <section className="pt-3 px-3 content-max prose">
            <div className="pb-3">{/* <Breadcrumbs /> */}</div>
            <div className="row">
              <div className="col-sm-8 col-md-12 col-lg-8 col-xl-9">
                <h1>{frontMatter.title}</h1>
                {children}
                <GitHubCTA />
              </div>
              <div className="col-sm-4 col-md-12 col-lg-4 col-xl-3">
                <div className="page-nav">
                  <div className="doc-toc">
                    <div className="doc-toc-title">
                      <h6>On this page</h6>
                    </div>
                    <ul className="section-nav">
                      {toc.map((entry) => (
                        <li className="toc-entry" key={entry.url}>
                          <Link href={entry.url}>{entry.value}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

const MDXLayoutRenderer = ({ mdxSource, ...rest }) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])
  return <MDXLayout components={MDXComponents} {...rest} />;
}

export default async function Page({ params }) {
  // get frontmatter of all docs in tree
  const docs = await getAllFilesFrontMatter();
  
  // get the MDX for the current doc and render it
  const slug = params.path
    ? ['contributing', ...params.path].join('/')
    : 'contributing';
  const doc = await getFileBySlug(slug);
  const { mdxSource, toc, frontMatter } = doc;
  
  // pass frontmatter tree into sidebar, rendered page + fm into middle, headers into toc
  return (
    <MDXLayoutRenderer
      docs={docs}
      toc={toc}
      mdxSource={mdxSource}
      frontMatter={frontMatter}
      />
  );
}