import './globals.css'; // Opsional: Hapus baris ini jika Anda belum punya file globals.css

export const metadata = {
  title: 'PODGE Ecosystem',
  description: 'Palm Oil Digital Governance Ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}