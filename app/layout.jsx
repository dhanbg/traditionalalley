import { defaultMetadata } from './metadata';
import ClientLayout from './client-layout';

export const metadata = defaultMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}