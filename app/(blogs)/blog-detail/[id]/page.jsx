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
      title: "Blog | Traditional Alley",
      description: "Read the latest fashion news, styling tips, and Nepali cultural heritage articles from Traditional Alley.",
    };
  }

  const title = `${blog.title} | Traditional Alley`;
  const description = blog.description || blog.desc || blog.excerpt || "Read stories about Nepali fashion, culture, and traditional attire from Traditional Alley.";
  const imageUrl = blog.imgSrc?.startsWith('http') 
    ? blog.imgSrc 
    : `https://traditionalalley.com.np${blog.imgSrc || '/logo.png'}`;

  return {
    title,
    description: description.substring(0, 160),
    alternates: {
      canonical: `/blog-detail/${id}`,
    },
    openGraph: {
      title,
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
      title,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <BlogDetail1 blog={blog} />
      <RelatedBlogs />
      <Footer1 />
    </>
  );
}
