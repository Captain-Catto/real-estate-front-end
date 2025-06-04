import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/images/logo.svg";

export function Logo() {
  return (
    <Link href="/" id="logo" className="flex items-center w-20 h-10 relative">
      <Image src={logoWhite} fill alt="Company Logo" />
    </Link>
  );
}
