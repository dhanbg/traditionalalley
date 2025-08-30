import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedPost({ post }) {
  const {
    id,
    title,
    excerpt,
    thumbnail,
    originalUrl,
    source,
    publishedDate,
    author
  } = post;

  return (
    <div className="wg-blog style-row hover-image mb_40">
      <div className="image">
        <Image
          className="lazyload"
          alt={title}
          src={thumbnail}
          width={600}
          height={399}
        />
      </div>
      <div className="content">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-10">
          <div className="meta">
            <div className="meta-item gap-8">
              <div className="icon">
                <i className="icon-calendar" />
              </div>
              <p className="text-caption-1">{publishedDate}</p>
            </div>
            <div className="meta-item gap-8">
              <div className="icon">
                <i className="icon-user" />
              </div>
              <p className="text-caption-1">
                by{" "}
                <span className="link">
                  {author}
                </span>
              </p>
            </div>
            <div className="meta-item gap-8">
              <div className="icon">
                <i className="icon-link" />
              </div>
              <p className="text-caption-1">
                Source: <span className="link">{source}</span>
              </p>
            </div>
          </div>
        </div>
        <h5 className="title">
          <a 
            className="link" 
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        </h5>
        <p>{excerpt}</p>
        <div className="d-flex align-items-center justify-content-between">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link text-button bot-button"
          >
            Read Original Article
          </a>
          <div className="featured-badge">
            <span className="badge bg-primary text-white px-2 py-1 rounded">
              Featured on Traditional Alley
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}