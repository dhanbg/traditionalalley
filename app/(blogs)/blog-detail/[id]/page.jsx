import BlogDetail1 from "@/components/blogs/BlogDetail1";
import RelatedBlogs from "@/components/blogs/RelatedBlogs";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import { allBlogs } from "@/data/blogs";
import React from "react";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const blog = allBlogs.find((p) => String(p.id) === String(id)) || allBlogs[0];

  if (!blog) {
    return {
      title: "Blog",
      description: "Read the latest fashion news, styling tips, and Nepali cultural heritage articles from Traditional Alley.",
    };
  }

  const blogTitle = blog.title;
  const fullTitle = `${blogTitle} | Traditional Alley`;
  const description = blog.description || blog.desc || blog.excerpt || "Read stories about Nepali fashion, culture, and traditional attire from Traditional Alley.";
  const imageUrl = blog.imgSrc?.startsWith('http') 
    ? blog.imgSrc 
    : `https://traditionalalley.com.np${blog.imgSrc || '/logo.png'}`;

  return {
    title: blogTitle,
    description: description.substring(0, 160),
    alternates: {
      canonical: `/blog-detail/${id}`,
    },
    openGraph: {
      title: fullTitle,
      description: description.substring(0, 160),
      url: `https://traditionalalley.com.np/blog-detail/${id}`,
      type: "article",
      siteName: "Traditional Alley",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description.substring(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const blog = allBlogs.find((p) => String(p.id) === String(id)) || allBlogs[0];

  const imageUrl = blog?.imgSrc?.startsWith('http') 
    ? blog.imgSrc 
    : `https://traditionalalley.com.np${blog?.imgSrc || '/logo.png'}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog?.title || "Traditional Alley Blog",
    description: blog?.description || blog?.desc || blog?.excerpt,
    image: [imageUrl],
    datePublished: "2025-08-13T00:00:00Z",
    dateModified: "2026-01-01T00:00:00Z",
    author: {
      "@type": "Person",
      name: blog?.author || "Traditional Alley",
    },
    publisher: {
      "@type": "Organization",
      name: "Traditional Alley",
      logo: {
        "@type": "ImageObject",
        url: "https://traditionalalley.com.np/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://traditionalalley.com.np/blog-detail/${id}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://traditionalalley.com.np",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://traditionalalley.com.np/blog-list",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog?.title || "Blog Post",
        item: `https://traditionalalley.com.np/blog-detail/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <BlogDetail1 blog={blog} />
      <RelatedBlogs />
      <Footer1 />
    </>
  );
}
