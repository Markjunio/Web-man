
import { Product } from './types.ts';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ELON FLASHER BASIC',
    version: '4.1',
    description: 'Entry-level quantum transfer software for standard USDT transactions. Perfect for beginners in the digital forest.',
    features: [
      'Quantum Speed Transfers (Standard)',
      'Basic Forest Protocol Security v1.0',
      'Up to 1,000 USDT/day volume',
      'Node detection avoidance (Standard)'
    ],
    specs: [
      { label: 'Portal Stability', value: '94.2%' },
      { label: 'Neural Latency', value: '450ms' },
      { label: 'Encryption', value: 'AES-256-Q' },
      { label: 'Tunneling', value: 'Basic' }
    ],
    price: 100,
    icon: 'bolt',
    command: 'elon-flasher --version 4.1 --speed basic'
  },
  {
    id: '2',
    name: 'ELON FLASHER PRO',
    version: '4.5',
    description: 'Professional quantum transfer software with enhanced speed and security features for serious traders.',
    features: [
      'Enhanced Quantum Speed Node Syncing',
      'Advanced Forest Protocol v2.4 Layer',
      'Up to 5,000 USDT/day volume',
      'Bypass standard exchange filters'
    ],
    specs: [
      { label: 'Portal Stability', value: '98.8%' },
      { label: 'Neural Latency', value: '120ms' },
      { label: 'Encryption', value: 'AES-512-Q' },
      { label: 'Tunneling', value: 'Advanced' }
    ],
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
    features: [
      'Multidimensional Portal Bridging',
      'Military-Grade Quantum Obfuscation',
      'Up to 20,000 USDT/day volume',
      'Real-time network congestion bypass'
    ],
    specs: [
      { label: 'Portal Stability', value: '99.5%' },
      { label: 'Neural Latency', value: '45ms' },
      { label: 'Encryption', value: 'Quantum-Chacha20' },
      { label: 'Tunneling', value: 'Multidimensional' }
    ],
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
    features: [
      'Quantum Tunneling Infrastructure',
      'Zero-Knowledge Proof Verification',
      'Unlimited Daily Transfer volume',
      'Automated bridge path optimization'
    ],
    specs: [
      { label: 'Portal Stability', value: '99.9%' },
      { label: 'Neural Latency', value: '8ms' },
      { label: 'Encryption', value: 'ZK-SNARK-512' },
      { label: 'Tunneling', value: 'Absolute Zero' }
    ],
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
    features: [
      'Reality-Bending Cross-Node Bridging',
      'Absolute Quantum Singularity Encryption',
      'Cross-Dimensional Multi-Chain Support',
      'Infinite scale architectural core'
    ],
    specs: [
      { label: 'Portal Stability', value: '100.0%' },
      { label: 'Neural Latency', value: 'Instant' },
      { label: 'Encryption', value: 'Omega-Root-5.0' },
      { label: 'Tunneling', value: 'Singularity' }
    ],
    price: 1000,
    oldPrice: 1200,
    badge: 'Ultimate',
    icon: 'infinity',
    command: 'elon-flasher --version 5.0 --reality-bend true'
  }
];
