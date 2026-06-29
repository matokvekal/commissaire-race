"use client";

import DictionaryInitializer from "@/components/DictionaryInitializer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DictionaryInitializer />
        {children}
      </body>
    </html>
  )
}
