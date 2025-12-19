
export interface Product {
  id: string;
  name: string;
  version: string;
  description: string;
  features: string[];
  price: number;
  oldPrice?: number;
  badge?: string;
  icon: string;
  command: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionResult {
  transactionId: string;
  licenseKey: string;
  status: 'COMPLETED' | 'FAILED';
  timestamp: string;
  quantumVerification: string;
}

export type PaymentMethodType = 'USDT' | 'BTC' | 'ETH' | 'QUANTUM';

export const PaymentMethod = {
  USDT: 'USDT' as PaymentMethodType,
  BTC: 'BTC' as PaymentMethodType,
  ETH: 'ETH' as PaymentMethodType,
  QUANTUM: 'QUANTUM' as PaymentMethodType
};

export type SoftwareStage = 'BOOT' | 'LICENSE' | 'CONFIG' | 'EXECUTING' | 'COMPLETE';
