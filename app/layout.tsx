import './globals.css';

export const metadata = {
  title: 'MapBook',
  description: 'MapBook service booking map app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
