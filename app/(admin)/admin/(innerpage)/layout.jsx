import { Roboto } from "next/font/google";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-roboto",
});

export const metadata = {
  title: "Admin",
  description: "Admin",
};

export default function AdminLayout({ children }) {
  return (
    <div
      className={`${roboto.variable} antialiased flex bg-stone-100 min-h-screen w-full`}
    >
      <div className="max-md:hidden">
        <Sidebar />
      </div>
      <div className="flex-grow bg-white">
        <Header />
        {children}
      </div>
    </div>
  );
}
