import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";
import "../public/css/custom.css"; // Custom CSS for compare products
import "../public/css/drift-basic.min.css"; // Drift zoom CSS
import ClientLayout from "./ClientLayout";
import { metadata as globalMetadata } from "./metadata";

export const metadata = globalMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body suppressHydrationWarning={true}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
