import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — Interactive Kanban Board",
  description:
    "A modern, responsive Kanban board for managing tasks with drag-and-drop, rich text editing, filtering, dark mode, and more.",
  keywords: ["kanban", "task management", "project management", "drag and drop"],
  openGraph: {
    title: "TaskFlow — Interactive Kanban Board",
    description:
      "Manage your tasks efficiently with smooth drag-and-drop, rich text editing, and a beautiful modern interface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">{children}</body>
    </html>
  );
}
