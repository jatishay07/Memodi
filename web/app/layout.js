import './globals.css';
import Providers from './providers';
import ClientTabNav from '../components/ClientTabNav';

export const metadata = {
  title: 'Memodi',
  description: 'Helping memories stay close.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="flex-1 pb-20 md:pb-0 md:pl-56">
            {children}
          </main>
          <ClientTabNav />
        </Providers>
      </body>
    </html>
  );
}
