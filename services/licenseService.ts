
/**
 * Main license keys authorized for software execution.
 */
const MASTER_KEYS = [
  'XTG654GHD',
  'TCX5FGHDSG',
  'DXYTES6GH0'
];

/**
 * Validates whether a provided key is in the master list and hasn't been used yet.
 */
export const validateLicenseKey = (key: string): boolean => {
  const upperKey = key.toUpperCase();
  const isValid = MASTER_KEYS.includes(upperKey);
  
  if (isValid) {
    const usedKeys = JSON.parse(localStorage.getItem('used_elon_keys') || '[]');
    if (usedKeys.includes(upperKey)) return false; // Already used
    return true;
  }
  return false;
};

/**
 * Persists the usage of a key to local storage to prevent multi-use of single-use keys.
 */
export const markKeyAsUsed = (key: string) => {
  const upperKey = key.toUpperCase();
  const usedKeys = JSON.parse(localStorage.getItem('used_elon_keys') || '[]');
  if (!usedKeys.includes(upperKey)) {
    usedKeys.push(upperKey);
    localStorage.setItem('used_elon_keys', JSON.stringify(usedKeys));
  }
};

/**
 * Returns the list of authorized master keys.
 */
export const getMasterKeys = () => MASTER_KEYS;
