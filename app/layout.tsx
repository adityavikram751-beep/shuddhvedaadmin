import "./globals.css";
import AuthGuard from "@/app/components/AuthGuard";

export const metadata = {
  title: "ShuddhVeda Honey Admin",
  description: "ShuddhVeda Honey Admin Panel",
  icons: {
    icon: "/yellow logo.png",
    shortcut: "/yellow logo.png",
    apple: "/yellow logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/yellow logo.png" type="image/png" />
        <link rel="shortcut icon" href="/yellow logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/yellow logo.png" />
      </head>
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}