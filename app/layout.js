export const metadata = { title: '오늘 기분 기록기' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: 'sans-serif', maxWidth: 420, margin: '40px auto', padding: '0 16px' }}>
        {children}
      </body>
    </html>
  );
}
