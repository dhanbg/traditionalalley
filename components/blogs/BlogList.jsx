import React from "react";
import Sidebar from "./Sidebar";
import Pagination from "../common/Pagination";
import Link from "next/link";
import Image from "next/image";
import FeaturedPost from "./FeaturedPost";
import { getAllFeaturedPosts } from "@/data/featuredPosts";
export default function BlogList() {
  const featuredPosts = getAllFeaturedPosts();
  
  return (
    <div className="main-content-page">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mb-lg-30">

            
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post, i) => (
                <FeaturedPost key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-5">
                <h5>No Featured Posts Yet</h5>
                <p className="text-muted">Stay tuned for exciting features about Traditional Alley in popular blogs and publications!</p>
              </div>
            )}
            <ul className="wg-pagination">
              <Pagination />
            </ul>
          </div>
          <div className="col-lg-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
