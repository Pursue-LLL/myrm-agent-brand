/**
 * [INPUT]
 * - next/font/google
 *
 * [OUTPUT]
 * - landingFontClassName: Landing 字体 CSS 变量 className
 *
 * [POS]
 * Landing 字体加载。根 layout 挂载 Newsreader / Outfit / JetBrains Mono。
 */
import { JetBrains_Mono, Newsreader, Outfit } from 'next/font/google';

export const landingSerif = Newsreader({
  subsets: ['latin'],
  variable: '--font-ed-serif',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const landingSans = Outfit({
  subsets: ['latin'],
  variable: '--font-ed-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const landingMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-ed-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const landingFontClassName = `${landingSerif.variable} ${landingSans.variable} ${landingMono.variable}`;
