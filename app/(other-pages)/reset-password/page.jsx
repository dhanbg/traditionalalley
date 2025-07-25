import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import ResetPassword from "@/components/otherPages/ResetPassword";
import Link from "next/link";
import React, { Suspense } from "react";

export const metadata = {
  title: "Reset Password || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">Reset Password</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    Pages
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>Reset Password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>

      <Footer1 />
    </>
  );
}