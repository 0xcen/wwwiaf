type PriceVariant = {
  sol: number;
  send: number;
};

const priceVariants: PriceVariant[] = [
  { sol: 0.005, send: 210 },
  { sol: 0.01, send: 420 },
  { sol: 0.015, send: 630 },
  { sol: 0.02, send: 840 },
  { sol: 0.025, send: 1050 },
];

export function getPrice(): PriceVariant {
  // Use a random number to select a price variant
  const randomIndex = Math.floor(Math.random() * priceVariants.length);
  const variant = priceVariants[randomIndex];

  return {
    sol: variant.sol,
    send: variant.send,
  };
}
