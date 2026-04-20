import './globals.css';

export const metadata = {
  title: 'Olamep',
  description: 'Olamep — Explore services around you',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
