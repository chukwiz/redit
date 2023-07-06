import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Noto_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import "@/styles/globals.css";
import Providers from "@/components/Providers";

const inter = Noto_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Readit",
  description: "Readit clone with next js and typescript",
};

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className=" min-h-screen pt-12 bg-slate-50 antialiased">
        <Providers>
          <Navbar />
          {authModal}
          <div className=" container max-w-7xl mx-auto h-full p-12">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
