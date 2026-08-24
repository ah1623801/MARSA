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