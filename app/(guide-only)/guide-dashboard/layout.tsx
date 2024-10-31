import Footer from "@/components/Guide/FooterSection";
import Navbar from "@/components/Guide/Navbar";
import React from "react";

export default function Layout({ children }: any) {
  return <div><Navbar/>{children} <Footer/></div>;
}
