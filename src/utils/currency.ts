/**
 * Currency formatting utilities
 */

/**
 * Format a number as currency with the given symbol
 */
export function formatCurrency(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Format a number as currency with USD symbol (default)
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount, "$");
}
