import React from "react";
import Image from "next/image";
import Link from "next/link";

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
                alt="Calling Icon"
                style={{
                  filter: "invert(100%)",
                  marginRight: "10px",
                }}
              />
              <a className="text-caption-1 text-white" href="tel:9812345678">
                9812345678
              </a>
            </li>
          </ul>

          <ul className="topbar-center d-flex justify-content-center">
            <li className="d-flex align-items-center">
              <Image
                src="/mail.png"
                width={30}
                height={30}
                alt="Mail Icon"
                style={{
                  filter: "invert(100%)",
                  marginRight: "10px",
                }}
              />
              <a className="text-caption-1 text-white" href="#">
                traditionalalley.com.np
              </a>
            </li>
          </ul>

          <ul className="topbar-right">
            <li>
              <Link
                className="text-caption-1 text-white text-decoration-underline"
                href={`/store-list`}
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
