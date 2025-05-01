import type { Metadata } from "next";
import { NavHelper } from "./nav-helper";

export const metadata: Metadata = {
  title: "Dashboard - IMS Portal",
  description: "Overview of institute information and statistics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavHelper />
      {children}
    </>
  );
}
