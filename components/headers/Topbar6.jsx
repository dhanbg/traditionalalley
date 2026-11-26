import React from "react";
import Image from "next/image";
import Link from "next/link";
import SafeEmail from "@/components/common/SafeEmail";

export default function Topbar6({ bgColor = "bg-blue-2" }) {
  return (
    <div className={`tf-topbar ${bgColor}`}>
      <div className="container">
        <div className="tf-topbar_wrap d-flex align-items-center justify-content-between"> 
          <ul className="topbar-left d-flex align-items-center">
            <li className="d-flex align-items-center">
              <Image
                src="/calling.png"
                width={30}
                height={30}
                priority
                alt="Calling Icon"
                style={{
                  width: "30px",
                  height: "30px",
                  filter: "invert(100%)",
                  marginRight: "10px",
                }}
              />
              <a className="text-caption-1 text-white" href="tel:9844594187">
                9844594187
              </a>
            </li>
          </ul>

          <ul className="topbar-center d-flex justify-content-center">
            <li className="d-flex align-items-center">
              <Image
                src="/mail.png"
                width={30}
                height={30}
                priority
                alt="Mail Icon"
                style={{
                  width: "30px",
                  height: "30px",
                  filter: "invert(100%)",
                  marginRight: "10px",
                }}
              />
              <SafeEmail
                asLink
                user="contact"
                domain="traditionalalley.com.np"
                className="text-caption-1 text-white"
              />
            </li>
          </ul>

          <ul className="topbar-right">
            <li>
              <Link
                className="text-caption-1 text-white text-decoration-underline"
                href={`/contact`}
              >
                Our Store Location
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
