import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { KitchenProvider } from "./contexts/KitchenContext";
import { RefreshProvider } from "./contexts/RefreshContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppWrapper from "./components/AppWrapper";
import AntdRegistry from "@/lib/antd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý nhà hàng",
  description: "Hệ thống quản lý và phục vụ nhà hàng chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <body className={`${geistSans.variable} antialiased`}>
        <AntdRegistry>
          <AuthProvider>
            <SocketProvider>
              <KitchenProvider>
                <RefreshProvider>
                  <AppWrapper>
                    {children}
                  </AppWrapper>
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                  />
                </RefreshProvider>
              </KitchenProvider>
            </SocketProvider>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
