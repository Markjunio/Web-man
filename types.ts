
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

export enum PaymentMethod {
  USDT = 'USDT',
  BTC = 'BTC',
  ETH = 'ETH',
  QUANTUM = 'QUANTUM'
}
