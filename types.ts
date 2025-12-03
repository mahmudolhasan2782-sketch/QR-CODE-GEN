export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  includeLogo: boolean;
  logoUrl: string | null;
  logoSize: number;
}

export type DownloadFormat = 'png' | 'jpg' | 'pdf';