const IPFS_POTTED_PLANT_BASE_URL =
  "https://gateway.pinata.cloud/ipfs/Qma6J1XLwV6H1XgEMY5h6GqdFaYbLmu49iT1GBCcSgk32C";

const SHRUB_POTTED_PLANT_BASE_URL = "https://shrub.finance";

// hosted in IPFS
export const IMAGE_ASSETS: any = {
  emptyPot: "https://shrub.finance/assets/pot.svg",
  fertilizer: "https://shrub.finance/assets/fertilizer.svg",
  waterCan: "https://shrub.finance/assets/water-can.svg",
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
  getPottedPlant: (
    type: string,
    stage: number,
    emotion: string,
    fetchFrom?: string
  ) => {
    if (fetchFrom && fetchFrom === "shrub") {
      return `${SHRUB_POTTED_PLANT_BASE_URL}/assets/potted-plants/pottedplant-${type}-${stage}-${emotion}.svg`;
    } else {
      return `${IPFS_POTTED_PLANT_BASE_URL}/pottedplant-${type}-${stage}-${emotion}.svg`;
    }
  },

  percentageToStage: (growthPercentage: number) =>
    Math.floor(growthPercentage / 20),
};
