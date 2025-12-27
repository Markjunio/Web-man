
import { Product } from './types.ts';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ELON FLASH BASIC',
    version: '4.1',
    description: 'Simple software for basic USDT transfers. Great for beginners who want to try our technology.',
    features: [
      'Standard Transfer Speed',
      'Basic Security Protection',
      'Up to 1,000 USDT daily limit',
      'Easy to use interface'
    ],
    specs: [
      { label: 'Reliability', value: '94.2%' },
      { label: 'Transfer Lag', value: 'Low' },
      { label: 'Security', value: 'Standard' },
      { label: 'Support', value: 'Email' }
    ],
    price: 100,
    maxAmount: 1000,
    icon: 'bolt',
    command: 'run --speed basic'
  },
  {
    id: '2',
    name: 'ELON FLASH PRO',
    version: '4.5',
    description: 'Professional software with faster speeds and better security for regular users.',
    features: [
      'Fast Transfer Speed',
      'Enhanced Privacy Layer',
      'Up to 5,000 USDT daily limit',
      'Works on all exchanges'
    ],
    specs: [
      { label: 'Reliability', value: '98.8%' },
      { label: 'Transfer Lag', value: 'Very Low' },
      { label: 'Security', value: 'High' },
      { label: 'Support', value: 'Priority' }
    ],
    price: 300,
    oldPrice: 350,
    maxAmount: 5000,
    icon: 'tachometer-alt',
    command: 'run --speed fast'
  },
  {
    id: '3',
    name: 'ELON FLASH ELITE',
    version: '4.8',
    description: 'Advanced software for high-volume transfers. Our most popular choice for value.',
    features: [
      'Super Fast Transfers',
      'Advanced Encryption Tech',
      'Up to 20,000 USDT daily limit',
      'Auto-connect to best networks'
    ],
    specs: [
      { label: 'Reliability', value: '99.5%' },
      { label: 'Transfer Lag', value: 'Minimal' },
      { label: 'Security', value: 'Ultra' },
      { label: 'Support', value: '24/7 Live' }
    ],
    price: 600,
    oldPrice: 750,
    maxAmount: 20000,
    badge: 'Best Value',
    icon: 'layer-group',
    command: 'run --speed elite'
  },
  {
    id: '4',
    name: 'ELON FLASH QUANTUM',
    version: '4.9',
    description: 'State-of-the-art technology for instant transfers and maximum security.',
    features: [
      'Instant Transfer Speed',
      'Private Verification System',
      'Unlimited Daily Transfers',
      'Automatic path selection'
    ],
    specs: [
      { label: 'Reliability', value: '99.9%' },
      { label: 'Transfer Lag', value: 'None' },
      { label: 'Security', value: 'Maximum' },
      { label: 'Support', value: 'VIP Personal' }
    ],
    price: 850,
    oldPrice: 950,
    maxAmount: 100000,
    icon: 'rocket',
    command: 'run --speed instant'
  },
  {
    id: '5',
    name: 'ELON FLASH OMEGA',
    version: '5.0',
    description: 'The ultimate software. Features the latest technology for absolute speed and safety.',
    features: [
      'Reality-Bending Speed',
      'Strongest Security Available',
      'Works with all Blockchains',
      'Lifetime system updates'
    ],
    specs: [
      { label: 'Reliability', value: '100.0%' },
      { label: 'Transfer Lag', value: 'Instant' },
      { label: 'Security', value: 'Total' },
      { label: 'Support', value: 'Direct Admin' }
    ],
    price: 1000,
    oldPrice: 1200,
    maxAmount: 1000000,
    badge: 'Ultimate',
    icon: 'infinity',
    command: 'run --speed omega'
  }
];