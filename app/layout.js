import "./globals.css";
import { font_class_names } from "./fonts";

export const metadata = {
  title: "KnoxFit",
  description: "KnoxFit fitness studios in Delhi NCR",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font_class_names}>
      <body>{children}</body>
    </html>
  );
}
