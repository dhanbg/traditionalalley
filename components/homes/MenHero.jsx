"use client";
import Link from "next/link";

export default function MenHero() {
  return (
    <div className="page-title" style={{
      backgroundImage: "url(/images/section/page-title.jpg)",
      height: "250px",
      minHeight: "250px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="container" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
      }}>
        <div className="row">
          <div className="col-12">
            <h3 className="heading text-center">Men</h3>
            <ul className="breadcrumbs d-flex align-items-center justify-content-center">
              <li>
                <Link className="link" href="/">
                  Homepage
                </Link>
              </li>
              <li>
                <i className="icon-arrRight" />
              </li>
              <li>Men</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}