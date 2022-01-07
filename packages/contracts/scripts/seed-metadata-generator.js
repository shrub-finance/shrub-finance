const {mkdir, writeFileSync} = require('fs');

let index = 0;

const types = [
  {
    name: 'Paper Seed of Power',
    count: 10,
    image: 'ipfs://power',
    rarity: 'legendary',
    classType: 'power'
  },
  {
    name: 'Paper Seed of Hope',
    count: 100,
    image: 'ipfs://hope',
    rarity: 'rare',
    classType: 'hope'
  },
  {
    name: 'Paper Seed of Passion',
    count: 1000,
    image: 'ipfs://passion',
    rarity: 'uncommon',
    classType: 'passion'
  },
  {
    name: 'Paper Seed of Wonder',
    count: 8890,
    image: 'ipfs://wonder',
    rarity: 'common',
    classType: 'wonder'
  },
]

mkdir('output/seedNft', { recursive: true }, err => console.log(err));
for (const type of types) {
  const {name, count, image, rarity, classType} = type;
  for (let i = 0; i < count; i++) {
    const metadata = {
      name: `${name} #${i}`,
      image,
      attributes: [
        { trait_type: 'Class', value: classType},
        { trait_type: 'Rarity', value: rarity},
        { trait_type: 'DNA', value: index % 100},
      ]
    }
    writeFileSync(`output/seedNft/${index}`, JSON.stringify(metadata))
    console.log(`writing #${index}`)
    index++;
  }
}
