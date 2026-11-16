import { Bebas_Neue, Figtree } from "next/font/google";

export const display_font = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const body_font = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const font_class_names = `${display_font.variable} ${body_font.variable}`;
