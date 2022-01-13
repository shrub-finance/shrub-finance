const { mkdir, writeFileSync } = require("fs");

let index = 1;

const types = [
  {
    name: "Paper Seed of Power",
    count: 1,
    image: "ipfs://Qmagcgd5gDp7HACb2uuFXFLSWnnmRT2ZSdW4sSjHRaZ637",
    rarity: "legendary",
    classType: "power",
  },
  {
    name: "Paper Seed of Hope",
    count: 1,
    image: "ipfs://Qmbgm9sK5p9vN6TDnLjVJs6ZBfgTPy6eftGZMVnddE1YpZ",
    rarity: "rare",
    classType: "hope",
  },
  {
    name: "Paper Seed of Passion",
    count: 2,
    image: "ipfs://QmbKAe82vBgugba2CQoFndq6XE1DLRZAk1D8xbdLp5gboY",
    rarity: "uncommon",
    classType: "passion",
  },
  {
    name: "Paper Seed of Wonder",
    count: 3,
    image: "ipfs://Qmbg9s53Bs9QEw9g94mPfKrjgW79AvaFY43d6YahjAC2Hu",
    rarity: "common",
    classType: "wonder",
  },
];

mkdir("output/seedNft", { recursive: true }, (err) => console.log(err));
for (const type of types) {
  const { name, count, image, rarity, classType } = type;
  for (let i = 0; i < count; i++) {
    const metadata = {
      name: `${name} #${i}`,
      image,
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
