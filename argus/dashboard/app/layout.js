export const metadata = {
  title: 'ARGUS Dashboard',
  description: 'Autonomous Business Intelligence Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0a0a0f', color: '#e0e0e0' }}>
        {children}
      </body>
    </html>
  );
}
