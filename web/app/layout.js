import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Memodi',
  description: 'A warm memory companion for dementia patients'
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
