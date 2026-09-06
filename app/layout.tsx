import type { Metadata } from "next";
import "@/app/styles/globals.scss";
import { staticMetadata } from "@/app/metadata";

export const metadata: Metadata = staticMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body>{children}</body>
    </html>
  );
}
