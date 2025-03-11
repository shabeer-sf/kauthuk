import Footer from "@/components/Footer";
import Header from "@/components/MainComponents/Header";
import { CartProvider } from "@/providers/CartProvider";
import { UserAuthProvider } from "@/providers/UserProvider";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lexend",
});

export default function MainLayout({ children }) {
  return (
    <UserAuthProvider>
    <CartProvider>
    <main className={`w-full ${lexend.variable}`}>
      <Header />
      <div className="w-full px-3 min-h-screen">
      {children}
      </div>
      <Footer />
    </main>
    </CartProvider>
    </UserAuthProvider>
  );
}
