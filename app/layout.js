import "./globals.css";

export const metadata = {
  title: "Word Wall",
  description: "Send one word. Watch everyone's words appear live.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400;1,500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
