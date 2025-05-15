import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserStatus from "./components/UserStatus";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ChatNest",
  description: "A simple real-time chat app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-purple-100`}>

        {/* ✅ Navbar */}
        <nav className="w-full p-4 bg-white shadow-md">
          <div className="max-w-6xl mx-auto">
            <UserStatus />
          </div>
        </nav>

        {/* ✅ Main Content */}
        <main className="flex-grow">{children}</main>

        {/* ✅ Footer */}
        <Footer />
        
      </body>
    </html>
  );
}
