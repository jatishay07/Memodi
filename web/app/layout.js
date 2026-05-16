import './globals.css';
import Providers from './providers';
import ClientTabNav from '../components/ClientTabNav';

export const metadata = {
  title: 'Memodi',
  description: 'A warm memory companion for dementia patients'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-navy min-h-screen flex flex-col">
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
