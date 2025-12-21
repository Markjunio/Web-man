/**
 * Main license keys authorized for software execution.
 */
const MASTER_KEYS = [
  'XTG654GHD',
  'TCX5FGHD',
  'DXYTES6GH0',
  'OMEGA-ROOT-ACCESS-5.0',
  'FLASH-999-X-QUANTUM',
  'NODE-PRIMARY-TRC20-SYNC',
  'QUANTUM-TUNNEL-VIP-001',
  'ELON-MARS-TRANSFER-PRO',
  'USDT-FLASH-MASTER-2025',
  'BEYOND-THE-FOREST-CORE',
  'VOID-PROTOCOL-SIGNATURE',
  'NEURAL-LINK-USDT-v5',
  'SATOSHI-GHOST-KEY-00',
  'QUANTUM-VIP-2025',
  'ELON-FLASHER-PRO-MAX',
  'ROOT-KIT-FLASH-2025',
  'X-LOGIC-TUNNEL-888'
];

/**
 * Validates a key and ensures it hasn't been used.
 */
export const validateLicenseKey = (key: string): boolean => {
  if (!key) return false;
  
  const cleanKey = key.trim().toUpperCase();
  
  // 1. Static administrative keys ALWAYS work
  if (MASTER_KEYS.includes(cleanKey)) {
    return true;
  }
  
  // 2. Check persistent blacklist (Used Keys)
  if (isKeyAlreadyUsed(cleanKey)) {
    console.warn(`VALIDATION_FAILED: Key ${cleanKey} is already EXPENDED.`);
    return false;
  }
  
  // 3. Check purchased keys in the Vault
  try {
    const vaultData = localStorage.getItem('elon_vault');
    if (vaultData) {
      const vault = JSON.parse(vaultData);
      const existsInVault = vault.some((entry: any) => 
        entry.licenseKey.trim().toUpperCase() === cleanKey
      );
      if (existsInVault) return true;
    }
  } catch (e) {
    console.error("Vault access error:", e);
  }
  
  return false;
};

/**
 * Checks if a key exists in the persistent local blacklist.
 */
export const isKeyAlreadyUsed = (cleanKey: string): boolean => {
  try {
    const usedKeys = JSON.parse(localStorage.getItem('used_elon_keys') || '[]');
    return usedKeys.includes(cleanKey.trim().toUpperCase());
  } catch (e) {
    return false;
  }
};

/**
 * The "Burn" Protocol: 
 * 1. Blacklists the key permanently if not a master key.
 * 2. Physically removes it from the user's active Vault storage.
 */
export const markKeyAsUsed = (key: string) => {
  const cleanKey = key.trim().toUpperCase();
  
  // We don't "burn" master keys, they are for development/test
  if (MASTER_KEYS.includes(cleanKey)) {
    console.log(`MASTER_KEY_BYPASS: Key ${cleanKey} skipped burn protocol.`);
    return;
  }
  
  try {
    // A. Update Blacklist (Permanent used status)
    const usedKeysRaw = localStorage.getItem('used_elon_keys');
    const usedKeys = usedKeysRaw ? JSON.parse(usedKeysRaw) : [];
    
    if (!usedKeys.includes(cleanKey)) {
      usedKeys.push(cleanKey);
      localStorage.setItem('used_elon_keys', JSON.stringify(usedKeys));
    }

    // B. Remove from active vault
    const vaultData = localStorage.getItem('elon_vault');
    if (vaultData) {
      const vault = JSON.parse(vaultData);
      const updatedVault = vault.filter((entry: any) => 
        entry.licenseKey.trim().toUpperCase() !== cleanKey
      );
      localStorage.setItem('elon_vault', JSON.stringify(updatedVault));
    }

    console.log(`BURN_COMPLETE: Key ${cleanKey} neutralized.`);
    window.dispatchEvent(new Event('vault_updated'));
  } catch (e) {
    console.error("Burn sequence failed:", e);
  }
};

export const getMasterKeys = () => MASTER_KEYS;