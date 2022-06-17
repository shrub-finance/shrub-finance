const IPFS_POTTED_PLANT =
  "https://gateway.pinata.cloud/ipfs/Qma6J1XLwV6H1XgEMY5h6GqdFaYbLmu49iT1GBCcSgk32C";

export const IMAGE_ASSETS = {
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
  pottedPlantWonder0: "https://shrub.finance/assets/potted-plant-wonder.svg",
  pottedPlantWonder1:
    "https://gateway.pinata.cloud/ipfs/QmXTQ7Wgk5GQ8guUYverajH4AU2CXqXSK2uFmTmEFzMjYo/pottedplant-Wonder-1-happy.svg",
  pottedPlantWonder2:
    "https://gateway.pinata.cloud/ipfs/QmXTQ7Wgk5GQ8guUYverajH4AU2CXqXSK2uFmTmEFzMjYo/pottedplant-Wonder-2-happy.svg",
  pottedPlantWonder3:
    "https://gateway.pinata.cloud/ipfs/QmXTQ7Wgk5GQ8guUYverajH4AU2CXqXSK2uFmTmEFzMjYo/pottedplant-Wonder-3-happy.svg",
  pottedPlantWonder4:
    "https://gateway.pinata.cloud/ipfs/QmXTQ7Wgk5GQ8guUYverajH4AU2CXqXSK2uFmTmEFzMjYo/pottedplant-Wonder-4-happy.svg",
  pottedPlantPassion0: "https://shrub.finance/assets/potted-plant-passion.svg",
  pottedPlantPassion1: "",
  pottedPlantPassion2: "",
  pottedPlantPassion3: "",
  pottedPlantPassion4: "",
  pottedPlantHope0: "",
  pottedPlantHope1: "",
  pottedPlantHope2: "",
  pottedPlantHope3: "",
  pottedPlantHope4: "",
  pottedPlantPower0: "",
  pottedPlantPower1: "",
  pottedPlantPower2: "",
  pottedPlantPower3: "",
  pottedPlantPower4: "",

  getPottedPlant: (type: string, stage: number, emotion: string) =>
    `${IPFS_POTTED_PLANT}/pottedplant-${type}-${stage}-${emotion}.svg`,
  // pottedPlantHopeSad0: `${IPFS_POTTED_PLANT}/pottedplant-Hope-0-sad.svg`,
  // pottedPlantHopeHappy0: `${IPFS_POTTED_PLANT}/pottedplant-Hope-0-happy.svg`,
  // pottedPlantPassionSad0: `${IPFS_POTTED_PLANT}/pottedplant-Passion-0-sad.svg`,
  // pottedPlantPassionHappy0: `${IPFS_POTTED_PLANT}/pottedplant-Passion-0-happy.svg`,
  // pottedPlantPowerHappy0: `${IPFS_POTTED_PLANT}/pottedplant-Power-0-happy.svg`,
  // pottedPlantWonderSad0: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-0-sad.svg`,
  // pottedPlantWonderHappy0: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-0-happy.svg`,
  // pottedPlantHopeSad1: `${IPFS_POTTED_PLANT}/pottedplant-Hope-1-sad.svg`,
  // pottedPlantHopeHappy1: `${IPFS_POTTED_PLANT}/pottedplant-Hope-1-happy.svg`,
  // pottedPlantPassionSad1: `${IPFS_POTTED_PLANT}/pottedplant-Passion-1-sad.svg`,
  // pottedPlantPassionHappy1: `${IPFS_POTTED_PLANT}/pottedplant-Passion-1-happy.svg`,
  // pottedPlantPowerHappy1: `${IPFS_POTTED_PLANT}/pottedplant-Power-1-happy.svg`,
  // pottedPlantWonderSad1: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-1-sad.svg`,
  // pottedPlantWonderHappy1: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-1-happy.svg`,
  // pottedPlantHopeSad2: `${IPFS_POTTED_PLANT}/pottedplant-Hope-2-sad.svg`,
  // pottedPlantHopeHappy2: `${IPFS_POTTED_PLANT}/pottedplant-Hope-2-happy.svg`,
  // pottedPlantPassionSad2: `${IPFS_POTTED_PLANT}/pottedplant-Passion-2-sad.svg`,
  // pottedPlantPassionHappy2: `${IPFS_POTTED_PLANT}/pottedplant-Passion-2-happy.svg`,
  // pottedPlantPowerHappy2: `${IPFS_POTTED_PLANT}/pottedplant-Power-2-happy.svg`,
  // pottedPlantWonderSad2: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-2-sad.svg`,
  // pottedPlantWonderHappy2: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-2-happy.svg`,
  // pottedPlantHopeSad3: `${IPFS_POTTED_PLANT}/pottedplant-Hope-3-sad.svg`,
  // pottedPlantHopeHappy3: `${IPFS_POTTED_PLANT}/pottedplant-Hope-3-happy.svg`,
  // pottedPlantPassionSad3: `${IPFS_POTTED_PLANT}/pottedplant-Passion-3-sad.svg`,
  // pottedPlantPassionHappy3: `${IPFS_POTTED_PLANT}/pottedplant-Passion-3-happy.svg`,
  // pottedPlantPowerHappy3: `${IPFS_POTTED_PLANT}/pottedplant-Power-3-happy.svg`,
  // pottedPlantWonderSad3: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-3-sad.svg`,
  // pottedPlantWonderHappy3: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-3-happy.svg`,
  // pottedPlantHopeSad4: `${IPFS_POTTED_PLANT}/pottedplant-Hope-4-sad.svg`,
  // pottedPlantHopeHappy4: `${IPFS_POTTED_PLANT}/pottedplant-Hope-4-happy.svg`,
  // pottedPlantPassionSad4: `${IPFS_POTTED_PLANT}/pottedplant-Passion-4-sad.svg`,
  // pottedPlantPassionHappy4: `${IPFS_POTTED_PLANT}/pottedplant-Passion-4-happy.svg`,
  // pottedPlantPowerHappy4: `${IPFS_POTTED_PLANT}/pottedplant-Power-4-happy.svg`,
  // pottedPlantWonderSad4: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-4-sad.svg`,
  // pottedPlantWonderHappy4: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-4-happy.svg`,
  // pottedPlantHopeSad5: `${IPFS_POTTED_PLANT}/pottedplant-Hope-5-sad.svg`,
  // pottedPlantHopeHappy5: `${IPFS_POTTED_PLANT}/pottedplant-Hope-5-happy.svg`,
  // pottedPlantPassionSad5: `${IPFS_POTTED_PLANT}/pottedplant-Passion-5-sad.svg`,
  // pottedPlantPassionHappy5: `${IPFS_POTTED_PLANT}/pottedplant-Passion-5-happy.svg`,
  // pottedPlantPowerHappy5: `${IPFS_POTTED_PLANT}/pottedplant-Power-5-happy.svg`,
  // pottedPlantWonderSad5: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-5-sad.svg`,
  // pottedPlantWonderHappy5: `${IPFS_POTTED_PLANT}/pottedplant-Wonder-5-happy.svg`,
  //
  //
  //
  //
};
