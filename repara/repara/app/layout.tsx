import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Repara",
  description: "Gestão de assistência técnica de eletrônicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // className="dark" ativa o tema escuro do ShadCN
    <html lang="pt-BR" className="dark">
      <body className={`${plex.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
