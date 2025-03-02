import Header from "@/components/MainComponents/Header";
import { CartProvider } from "@/providers/CartProvider";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lexend",
});

export default function MainLayout({ children }) {
  return (
    <CartProvider>
    <main className={`w-full ${lexend.variable}`}>
      <Header />
      <div className="w-full px-3">
      {children}
      </div>
    </main>
    </CartProvider>
  );
}
