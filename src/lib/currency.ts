// D-Calc — Currency System

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CNY' | 'JPY' | 'CAD' | 'AUD' | 'MXN' | 'BRL' | 'INR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
  position: 'before' | 'after';
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES', decimals: 2, position: 'after' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2, position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2, position: 'before' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2, position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0, position: 'before' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2, position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2, position: 'before' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2, position: 'before' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2, position: 'before' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2, position: 'before' },
};

// Map browser locale to likely currency
export function detectCurrency(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'EUR';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lang = navigator.language;
  
  // Timezone-based detection
  if (tz.startsWith('Europe/Madrid') || tz.startsWith('Europe/Paris') || tz.startsWith('Europe/Berlin') || tz.startsWith('Europe/Rome')) return 'EUR';
  if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || tz.startsWith('America/Denver') || tz.startsWith('America/Los_Angeles')) return 'USD';
  if (tz.startsWith('Europe/London')) return 'GBP';
  if (tz.startsWith('Asia/Shanghai') || tz.startsWith('Asia/Hong_Kong')) return 'CNY';
  if (tz.startsWith('Asia/Tokyo')) return 'JPY';
  if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) return 'CAD';
  if (tz.startsWith('Australia/')) return 'AUD';
  if (tz.startsWith('America/Mexico_City')) return 'MXN';
  if (tz.startsWith('America/Sao_Paulo')) return 'BRL';
  if (tz.startsWith('Asia/Kolkata')) return 'INR';
  
  // Language fallback
  if (lang.startsWith('en-US')) return 'USD';
  if (lang.startsWith('en-GB')) return 'GBP';
  if (lang.startsWith('zh')) return 'CNY';
  if (lang.startsWith('ja')) return 'JPY';
  if (lang.startsWith('pt-BR')) return 'BRL';
  if (lang.startsWith('es-MX')) return 'MXN';
  
  // Default for European languages
  if (lang.startsWith('es') || lang.startsWith('fr') || lang.startsWith('de') || lang.startsWith('it') || lang.startsWith('eu')) return 'EUR';
  
  return 'USD';
}

export function formatCurrencyValue(amount: number, currencyCode: CurrencyCode): string {
  const info = CURRENCIES[currencyCode];
  const fixed = Math.round(amount * Math.pow(10, info.decimals)) / Math.pow(10, info.decimals);
  
  const parts = fixed.toFixed(info.decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];
  
  const formatted = info.decimals > 0 ? `${intPart},${decPart}` : intPart;
  
  return info.position === 'before' 
    ? `${info.symbol}${formatted}`
    : `${formatted} ${info.symbol}`;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}
