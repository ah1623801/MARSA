import './globals.css';

export const metadata = {
  title: 'MARSA — From the Sea to the Table',
  description: 'A Continuous Journey: Sea · Fire · Table',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020509',
};
