import { defaultMetadata } from './metadata';
import ClientLayout from './client-layout';

export const metadata = defaultMetadata;

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}