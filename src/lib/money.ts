export function usdToMinor(value: string): string {
  if (!/^(0|[1-9]\d{0,10})(\.\d{1,2})?$/.test(value))
    throw new Error("Enter a valid USD amount with up to two decimal places.");
  const [whole, fraction = ""] = value.split(".");
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"))).toString();
}
export function formatUsd(minor: string): string {
  const amount = BigInt(minor);
  return `$${(amount / 100n).toLocaleString("en-US")}.${(amount % 100n).toString().padStart(2, "0")}`;
}
