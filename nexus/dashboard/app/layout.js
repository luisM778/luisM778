export const metadata = {
  title: 'NEXUS Dashboard',
  description: 'Neural Executive System for Unified Strategy',
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
