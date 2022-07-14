const IPFS_POTTED_PLANT =
  "https://gateway.pinata.cloud/ipfs/Qma6J1XLwV6H1XgEMY5h6GqdFaYbLmu49iT1GBCcSgk32C";

export const IMAGE_ASSETS: any = {
  emptyPot:
    "https://gateway.pinata.cloud/ipfs/QmUqvSgB7TkwU1Yf5EQcEZcoq4DcByiQG95Qom7eQpHj8g",
  fertilizer:
    "https://gateway.pinata.cloud/ipfs/QmRjcmBAdMTPaezG34mufeWfNiE1si269vWXyX93X3ah21",
  waterCan:
    "https://gateway.pinata.cloud/ipfs/QmeK7DoLGdNjZuvTsnUFzVrWvM9Fv5wBVq7r23C788RQUD",
  seeds: {
    Wonder: {
      happy: "https://shrub.finance/assets/wonder.svg",
      sad: "https://shrub.finance/assets/wonder-sad.svg",
    },
    Passion: {
      happy: "https://shrub.finance/assets/passion.svg",
      sad: "https://shrub.finance/assets/passion-sad.svg",
    },
    Hope: {
      happy: "https://shrub.finance/assets/hope.svg",
      sad: "https://shrub.finance/assets/hope-sad.svg",
    },
    Power: {
      happy: "https://shrub.finance/assets/power.svg",
      sad: "https://shrub.finance/assets/power.svg",
    },
  },

  // use for potted plant asset
  getPottedPlant: (type: string, stage: number, emotion: string) =>
    `${IPFS_POTTED_PLANT}/pottedplant-${type}-${stage}-${emotion}.svg`,

  percentageToStage: (growthPercentage: number) =>
    Math.floor(growthPercentage / 0.2),
};
