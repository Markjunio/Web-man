
import { Product } from './types.ts';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ELON FLASHER BASIC',
    version: '4.1',
    description: 'Entry-level quantum transfer software for standard USDT transactions. Perfect for beginners in the digital forest.',
    features: ['Quantum Speed Transfers', 'Basic Forest Protocol Security', 'Up to 1,000 USDT/day', '24/7 Basic Support'],
    price: 100,
    icon: 'bolt',
    command: 'elon-flasher --version 4.1 --speed basic'
  },
  {
    id: '2',
    name: 'ELON FLASHER PRO',
    version: '4.5',
    description: 'Professional quantum transfer software with enhanced speed and security features for serious traders.',
    features: ['Enhanced Quantum Speed', 'Advanced Forest Protocol', 'Up to 5,000 USDT/day', 'Priority Support'],
    price: 300,
    oldPrice: 350,
    icon: 'tachometer-alt',
    command: 'elon-flasher --version 4.5 --speed enhanced'
  },
  {
    id: '3',
    name: 'ELON FLASHER ELITE',
    version: '4.8',
    description: 'Advanced software with multidimensional portal technology for high-volume, instant transfers.',
    features: ['Multidimensional Portals', 'Military-Grade Encryption', 'Up to 20,000 USDT/day', 'Dedicated Account Manager'],
    price: 600,
    oldPrice: 750,
    badge: 'Best Value',
    icon: 'layer-group',
    command: 'elon-flasher --version 4.8 --portal multidimensional'
  },
  {
    id: '4',
    name: 'ELON FLASHER QUANTUM',
    version: '4.9',
    description: 'Cutting-edge quantum tunneling technology for institutional-level transfers and security.',
    features: ['Quantum Tunneling Tech', 'Zero-Knowledge Proofs', 'Unlimited Daily Transfers', '24/7 VIP Support'],
    price: 850,
    oldPrice: 950,
    icon: 'rocket',
    command: 'elon-flasher --version 4.9 --tunnel quantum'
  },
  {
    id: '5',
    name: 'ELON FLASHER OMEGA',
    version: '5.0',
    description: 'The ultimate quantum transfer software with reality-bending capabilities and absolute security.',
    features: ['Reality-Bending Transfers', 'Absolute Quantum Encryption', 'Cross-Dimensional Transfers', 'Personal Quantum Engineer'],
    price: 1000,
    oldPrice: 1200,
    badge: 'Ultimate',
    icon: 'infinity',
    command: 'elon-flasher --version 5.0 --reality-bend true'
  }
];
