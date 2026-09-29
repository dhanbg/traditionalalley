"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogDetail1({ blog }) {
  if (!blog) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://traditionalalley.com.np/blog-detail/${blog.id}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(blog.title || "Traditional Alley");

  return (
    <div className="blog-detail-wrap">
      <div className="inner">
        <div className="heading text-center">
          <ul className="list-tags has-bg justify-content-center mb_16">
            <li>
              <span className="link text-btn-uppercase">
                {blog.category || "Nepali Fashion"}
              </span>
            </li>
          </ul>
          <h2 className="fw-6 mb_16">{blog.title}</h2>
          <div className="meta justify-content-center mb_24">
            <div className="meta-item gap-8">
              <div className="icon">
                <i className="icon-calendar" />
              </div>
              <p className="body-text-1">{blog.date || "March 2026"}</p>
            </div>
            <div className="meta-item gap-8">
              <div className="icon">
                <i className="icon-user" />
              </div>
              <p className="body-text-1">
                by{" "}
                <Link className="link fw-6" href="/about-us">
                  {blog.author || "Traditional Alley"}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {blog.imgSrc && (
          <div className="featured-image mb_32 text-center">
            <Image
              alt={blog.imgAlt || blog.title}
              src={blog.imgSrc}
              width={1000}
              height={550}
              priority
              className="rounded-3 w-100 object-fit-cover shadow-sm"
              style={{ maxHeight: "550px" }}
            />
          </div>
        )}

        <div className="content">
          {blog.intro && (
            <p className="body-text-1 lead mb_20 fw-5 text-dark" style={{ fontSize: "1.15rem", lineHeight: "1.8" }}>
              {blog.intro}
            </p>
          )}

          {blog.isExternal && blog.externalUrl && (
            <div className="p-3 mb_24 rounded-3 border bg-light d-flex align-items-center justify-content-between flex-wrap gap-12">
              <div>
                <span className="badge bg-main text-white me-2">Press Coverage</span>
                <strong>Featured in {blog.source || "National Media"}</strong>
              </div>
              <a
                href={blog.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tf-btn btn-outline animate-hover-btn btn-sm"
              >
                Read on {blog.source || "Kathmandu Post"} &rarr;
              </a>
            </div>
          )}

          {Array.isArray(blog.sections) &&
            blog.sections.map((sec, idx) => (
              <div key={idx} className="blog-section mb_24">
                <h4 className="fw-6 mb_12 text-main">{sec.heading}</h4>
                <p className="body-text-1 text-secondary mb_16" style={{ fontSize: "1.05rem", lineHeight: "1.75" }}>
                  {sec.content}
                </p>
                {Array.isArray(sec.bullets) && (
                  <ul className="list-text type-disc mb_16 ps-4">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="body-text-1 mb_8 text-secondary">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          {blog.cta && (
            <div className="cta-box p-4 my-4 rounded-3 text-center border bg-surface shadow-sm">
              <h4 className="fw-6 mb_8">Looking for Authentic Nepali Fashion?</h4>
              <p className="mb_16 text-secondary" style={{ maxWidth: "600px", margin: "0 auto 16px" }}>
                Handcrafted by master artisans with genuine handloom fabrics and delivered express worldwide.
              </p>
              <Link href={blog.cta.href} className="tf-btn btn-fill animate-hover-btn">
                {blog.cta.text}
              </Link>
            </div>
          )}
        </div>

        <div className="bot d-flex justify-content-between align-items-center gap-16 flex-wrap mt_32 pt_20 border-top">
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <ul className="list-tags has-bg d-flex flex-wrap gap-8">
              <li>
                <span className="fw-6">Tags:</span>
              </li>
              {blog.tags.map((tag, tIdx) => (
                <li key={tIdx}>
                  <Link href="/blog-list" className="link">
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="d-flex align-items-center gap-12 ms-auto">
            <span className="fw-6 text-caption-1">Share this post:</span>
            <ul className="tf-social-icon style-1 d-flex gap-8 list-unstyled mb-0">
              <li>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-facebook"
                  title="Share on Facebook"
                >
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-twiter"
                  title="Share on Twitter / X"
                >
                  <i className="icon icon-x" />
                </a>
              </li>
              <li>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pinterest"
                  title="Pin on Pinterest"
                >
                  <i className="icon icon-pinterest" />
                </a>
              </li>
              <li>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-whatsapp"
                  title="Share on WhatsApp"
                >
                  <i className="icon icon-whatsapp" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
