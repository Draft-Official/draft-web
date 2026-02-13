/** Strip non-numeric characters from an input value. */
export function filterNumericInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}
