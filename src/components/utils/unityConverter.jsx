// Système de conversion intelligent entre unités

const conversionRules = {
  // Masse
  'kg': { base: 'g', factor: 1000 },
  'g': { base: 'g', factor: 1 },
  't': { base: 'g', factor: 1000000 },
  
  // Volume
  'L': { base: 'ml', factor: 1000 },
  'ml': { base: 'ml', factor: 1 },
  
  // Longueur
  'm': { base: 'cm', factor: 100 },
  'cm': { base: 'cm', factor: 1 }
};

/**
 * Convertit une quantité d'une unité à une autre
 */
export function convertUnity(quantity, fromUnit, toUnit) {
  if (!quantity || !fromUnit || !toUnit) return null;
  if (fromUnit === toUnit) return quantity;
  
  const fromRule = conversionRules[fromUnit];
  const toRule = conversionRules[toUnit];
  
  if (!fromRule || !toRule || fromRule.base !== toRule.base) {
    return null;
  }
  
  const baseQuantity = quantity * fromRule.factor;
  return baseQuantity / toRule.factor;
}

export function formatQuantity(quantity, unit) {
  if (!quantity) return '0 ' + unit;
  return `${quantity.toFixed(2)} ${unit}`;
}

export function areUnitsCompatible(unit1, unit2) {
  if (unit1 === unit2) return true;
  const rule1 = conversionRules[unit1];
  const rule2 = conversionRules[unit2];
  return rule1 && rule2 && rule1.base === rule2.base;
}