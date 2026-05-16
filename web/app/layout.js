import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Memodi',
  description: 'Helping memories stay close.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
