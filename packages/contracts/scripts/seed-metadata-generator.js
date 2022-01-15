const { mkdirSync, writeFileSync } = require("fs");

let index = 1;

const types = [
  {
    name: "Paper Seed of Power",
    count: 10,
    image: "ipfs://QmNsRMnK9gaqbcNhQToXBYeHTnR9y9HtoBNewQXvkDNjbo",
    rarity: "legendary",
    classType: "power",
  },
  {
    name: "Paper Seed of Hope",
    count: 100,
    image: "ipfs://QmbFpE2ofJHig1Ci63DbshbEuaBtr9SAyLkeWn4Nofr7eJ",
    rarity: "rare",
    classType: "hope",
  },
  {
    name: "Paper Seed of Passion",
    count: 1000,
    image: "ipfs://QmekzPPxpX71gqe9yu5FtX1canvEPGK85X5h2yQFDBZdRD",
    rarity: "uncommon",
    classType: "passion",
  },
  {
    name: "Paper Seed of Wonder",
    count: 8890,
    image: "ipfs://QmUAiWcJLfrqcZDhTgPmnYgPJzZBkDMyzDrawpgQfjSex6",
    rarity: "common",
    classType: "wonder",
  },
];

mkdirSync("output/seedNft", { recursive: true });
for (const type of types) {
  const { name, count, image, rarity, classType } = type;
  for (let i = 0; i < count; i++) {
    const metadata = {
      name: `${name} #${i + 1}`,
      image,
      external_link: `https://shrub.finance/nft/paper-seed/${index}`,
      attributes: [
        { trait_type: "Class", value: classType },
        { trait_type: "Rarity", value: rarity },
        { trait_type: "DNA", value: index % 100 },
      ],
    };
    writeFileSync(`output/seedNft/${index}`, JSON.stringify(metadata));
    console.log(`writing #${index}`);
    index++;
  }
}
