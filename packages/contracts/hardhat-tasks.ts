import { task, types } from 'hardhat/config'
import "@nomiclabs/hardhat-ethers";
import {
  HashUtil__factory, PaperPot__factory, PaperPotMint__factory,
  PaperSeed__factory,
  PotNFTTicket__factory,
  SeedOrphanageV2__factory,
  ShrubExchange__factory, SMATICToken__factory,
  SUSDToken__factory, WETH__factory,
} from './types'
import { readFileSync } from 'fs'
import { OrderCommon, SmallOrder } from '@shrub/app/src/types'
import { ACTIVE_ORDERS_QUERY } from './queries'
import assert from 'node:assert/strict';


import { ApolloClient, gql, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";
import promptly from "promptly";
// import optionContracts from "./option-contracts.json";
import chainlinkAggregatorV3Interface from "./external-contracts/chainlinkAggregatorV3InterfaceABI.json";
import { address } from 'hardhat/internal/core/config/config-validation'
const bs = require("./utils/black-scholes");
const { Shrub712 } = require("./utils/EIP712");

function toEthDate(date: Date) {
  return Math.round(Number(date) / 1000);
}
function fromEthDate(ethDate: number) {
  return new Date(ethDate * 1000);
}

const CHAINLINK_MATIC = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada"; // Mumbai
const CHAINLINK_ETH = "0x0715A7794a1dc8e42615F059dD6e406A6594651A"; // Mumbai
const CHAINLINK_BTC = "0x007A22900a3B98143368Bd5906f8E17e9867581b"; // Mumbai
const CHAINLINK_LINK_MATIC = "0x12162c3E810393dEC01362aBf156D7ecf6159528"; // Mumbai
const CHAINLINK_USDC = "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0"; // Mumbai
const MINUTES_BETWEEN_ORDERS = 5; // For maker2


const expiryDates = [
  new Date("2022-05-02"),
  new Date("2022-06-02"),
  new Date("2022-07-02"),
  // [toEthDate(new Date('2021-12-11')).toString()] : standardStrikes,
  // [toEthDate(new Date('2021-12-18')).toString()] : standardStrikes,
  // [toEthDate(new Date('2021-12-25')).toString()] : standardStrikes,
];
const callsArr = [2e6, 2.3e6, 2.5e6, 2.7e6];
const putsArr = [2e6, 1.8e6, 1.6e6, 1.4e6];

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, env) => {
  const { ethers } = env;
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("unpausePotMinting", "Enables minting from PaperPotMint")
  .addParam("pause", "pause or unpause", false, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { pause } = taskArgs;
    const [deployer] = await ethers.getSigners();
    const paperPotMintDeployment = await deployments.get("PaperPotMint");
    const paperPotMint = PaperPotMint__factory.connect(paperPotMintDeployment.address, deployer);
    if (pause) {
      await paperPotMint.pauseMinting();
      console.log("pausing minting");
    } else {
      await paperPotMint.unpauseMinting();
      console.log("unpausing minting");
    }
  })

task("testPaperGardens", "Sets up a test env for paper gardens")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [deployer, account1, account2, account3, account4] = await ethers.getSigners();
    const seedDeployment = await deployments.get("PaperSeed");
    const paperPotDeployment = await deployments.get("PaperPot");
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const wethDeployment = await deployments.get("WETH");
    const WETH = WETH__factory.connect(
      wethDeployment.address,
      deployer
    );

    // Initialize NFT Ticket
    await env.run('initializeNFTTicket',{
      controller: account1.address,
      recipient: account2.address,
      contractAddress: paperPotDeployment.address,
      wlMintStartDate: '2022-06-08T13:00:00.000Z',
      wlMintEndDate: '2022-06-08T13:00:00.000Z',
      mintStartDate: '2022-06-09T14:00:00.000Z',
      mintEndDate: '2022-06-20T19:00:00.000Z',
      redeemEndDate: '2022-06-30T00:00:00.000Z',
      mintPrice: '35',
      wlMintPrice: '15',
      maxPerMint: 10,
      redeemPrice: '15',
      maxSupply: '1000'
    })

    // Activate Ticket
    await env.run('activateNFTTicket', {
      tokenId: '1',
      controller: account1.address
    })

    // Controller Mint NFT Ticket
    await env.run('controllerMintTicket', {
      tokenId: '1',
      controller: account1.address,
      addresses: [account3.address, account4.address]
    })
    await env.run('controllerMintTicket', {
      tokenId: '1',
      controller: account1.address,
      addresses: [account3.address, account4.address]
    })
    await env.run('controllerMintTicket', {
      tokenId: '1',
      controller: account1.address,
      addresses: [account3.address, account4.address]
    })
    await env.run('controllerMintTicket', {
      tokenId: '1',
      controller: account1.address,
      addresses: [account3.address, account4.address]
    })

    // Mint Seeds
    await env.run('mintSeed', {
      ids: [5,16,17,250,251,2181,2182,2186,2188,8888,8869]
    })

    // Send Seeds
    await env.run('sendSeed', {id: '5', receiver: account3.address});
    await env.run('sendSeed', {id: '16', receiver: account3.address});
    await env.run('sendSeed', {id: '17', receiver: account3.address});
    await env.run('sendSeed', {id: '250', receiver: account3.address});
    await env.run('sendSeed', {id: '251', receiver: account3.address});
    await env.run('sendSeed', {id: '2181', receiver: account3.address});
    await env.run('sendSeed', {id: '2182', receiver: account3.address});
    await env.run('sendSeed', {id: '2186', receiver: account4.address});
    await env.run('sendSeed', {id: '2188', receiver: account4.address});
    await env.run('sendSeed', {id: '8888', receiver: account4.address});
    await env.run('sendSeed', {id: '8869', receiver: account4.address});

    // Set Redeem Active
    await env.run('setRedeemActive', {
      controller: account1.address,
      tokenId: '1',
      active: true
    })

    // Unpause Minting from the PaperPot Side
    await env.run('unpausePot')

    // Specify the NFTTicket address and tokenId
    await env.run('setNftTicketInfo', {
      address: potNFTTicketDeployment.address,
      tokenId: '1'
    })

    // Mint Water
    await env.run('mintWater', {
      to: account3.address,
      amount: '20'
    })

    // Mint Fertilizer
    await env.run('mintFertilizer', {
      to: account3.address,
      amount: '3'
    })

    // Send WETH to accounts3 and 4
    await WETH.transfer(account3.address, ethers.constants.WeiPerEther);
    await WETH.transfer(account4.address, ethers.constants.WeiPerEther);

  })

task("getPaperPotUri", "get the uri from a paperPot token")
  .addParam("tokenId", "tokenId to get the uri for")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { tokenId } = taskArgs;
    const provider = ethers.provider;
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, provider);
    const uri = await paperPot.uri(tokenId);
    console.log(uri);
  })

task("setAllSadSeeds", "set all the sad seeds for the Paper Pot Contract")
  .addOptionalParam("atATime", "how many seeds to set at a time")
  .setAction(async (taskArgs, env) => {
    const sadSeeds = [16,25,30,50,55,90,92,93,94,101,102,108,110,111,119,138,151,156,163,164,167,181,201,208,209,215,217,219,222,233,234,237,246,250,272,275,276,291,293,294,295,302,304,313,315,317,319,325,331,338,343,345,349,354,364,367,376,390,392,393,412,413,419,429,451,462,465,483,496,498,502,510,512,514,521,530,531,532,533,538,557,571,576,579,585,592,637,643,645,649,651,655,660,661,664,669,673,675,684,685,690,693,700,702,706,714,718,719,728,734,739,744,745,748,749,754,757,764,765,767,772,773,779,783,795,796,804,806,808,815,816,817,820,827,832,834,844,848,853,856,857,861,864,867,874,875,878,885,888,890,900,905,914,920,927,935,937,944,960,967,971,973,980,991,995,998,1008,1012,1013,1024,1027,1033,1034,1039,1047,1056,1058,1064,1069,1071,1079,1080,1088,1092,1096,1097,1119,1121,1127,1133,1135,1136,1150,1162,1165,1169,1173,1174,1178,1188,1190,1193,1196,1203,1204,1206,1208,1210,1217,1228,1244,1252,1254,1264,1267,1276,1278,1281,1282,1284,1296,1297,1303,1304,1309,1310,1312,1327,1332,1336,1340,1348,1352,1361,1362,1366,1372,1377,1385,1386,1388,1389,1396,1402,1409,1416,1427,1436,1446,1451,1458,1464,1466,1471,1479,1490,1491,1496,1506,1507,1516,1524,1526,1529,1533,1535,1537,1539,1553,1555,1562,1567,1577,1584,1590,1592,1597,1598,1611,1616,1627,1631,1637,1642,1648,1668,1670,1672,1675,1691,1698,1699,1701,1702,1710,1716,1720,1726,1727,1732,1734,1747,1753,1762,1766,1773,1779,1784,1788,1793,1794,1810,1811,1827,1847,1858,1868,1874,1876,1878,1890,1892,1899,1911,1914,1918,1920,1934,1938,1940,1942,1947,1955,1967,1970,1977,1978,1984,1998,2001,2004,2005,2006,2017,2019,2024,2036,2042,2052,2058,2062,2069,2071,2072,2075,2089,2096,2099,2114,2115,2117,2139,2143,2146,2163,2164,2166,2170,2174,2181,2185,2186,2188,2189,2195,2199,2200,2202,2205,2206,2218,2219,2228,2230,2235,2238,2239,2249,2258,2260,2265,2280,2282,2284,2285,2290,2296,2301,2302,2309,2313,2315,2318,2326,2331,2333,2335,2339,2340,2343,2348,2356,2365,2366,2368,2369,2391,2394,2406,2407,2410,2413,2414,2416,2427,2429,2432,2446,2447,2458,2469,2474,2487,2490,2491,2492,2494,2501,2508,2511,2514,2557,2573,2574,2578,2580,2586,2593,2595,2598,2604,2620,2622,2625,2634,2638,2640,2644,2645,2646,2647,2651,2652,2653,2657,2659,2662,2670,2672,2673,2682,2683,2687,2688,2692,2697,2711,2713,2722,2723,2729,2730,2733,2737,2740,2742,2748,2749,2751,2753,2758,2762,2764,2766,2768,2779,2787,2803,2809,2812,2823,2824,2834,2837,2838,2845,2848,2849,2854,2861,2868,2870,2897,2898,2899,2900,2903,2908,2910,2917,2922,2927,2929,2931,2938,2939,2942,2943,2946,2951,2952,2958,2959,2960,2964,2969,2973,2987,2988,2991,2992,3001,3002,3005,3008,3011,3018,3032,3038,3055,3057,3065,3067,3068,3075,3087,3088,3094,3097,3104,3110,3124,3125,3128,3131,3138,3139,3147,3148,3155,3157,3170,3172,3177,3183,3185,3192,3199,3207,3215,3216,3219,3226,3232,3237,3239,3240,3247,3271,3277,3281,3284,3285,3286,3288,3289,3292,3295,3296,3299,3310,3313,3324,3342,3344,3356,3359,3365,3367,3368,3372,3375,3381,3392,3399,3400,3406,3411,3416,3418,3419,3425,3442,3443,3448,3452,3455,3456,3459,3465,3467,3469,3487,3494,3496,3498,3499,3501,3502,3509,3519,3532,3533,3534,3539,3544,3558,3564,3565,3566,3569,3571,3575,3582,3586,3599,3606,3607,3612,3614,3619,3633,3634,3636,3637,3640,3650,3651,3658,3666,3667,3674,3675,3676,3677,3681,3687,3689,3690,3691,3694,3698,3712,3713,3718,3720,3724,3726,3727,3729,3742,3751,3769,3772,3776,3779,3783,3784,3785,3789,3800,3802,3813,3815,3818,3831,3833,3837,3838,3841,3853,3855,3861,3873,3877,3881,3884,3888,3889,3892,3895,3896,3899,3908,3915,3923,3931,3933,3934,3937,3940,3946,3948,3952,3963,3969,3971,3975,3982,3984,3990,3992,3995,3997,4007,4016,4018,4020,4027,4031,4036,4040,4046,4051,4060,4062,4066,4075,4084,4089,4095,4098,4129,4134,4136,4151,4152,4158,4159,4160,4182,4185,4188,4202,4203,4205,4210,4212,4219,4232,4233,4234,4241,4243,4244,4245,4248,4249,4253,4255,4258,4261,4262,4264,4266,4271,4273,4274,4275,4283,4286,4290,4303,4307,4314,4319,4328,4338,4341,4354,4357,4362,4363,4366,4367,4371,4376,4379,4380,4383,4384,4391,4401,4406,4417,4421,4423,4437,4444,4446,4449,4452,4455,4458,4462,4464,4488,4491,4496,4498,4512,4522,4533,4535,4538,4544,4559,4572,4580,4582,4588,4590,4594,4603,4605,4608,4613,4614,4648,4651,4653,4662,4664,4666,4668,4673,4694,4705,4710,4712,4713,4718,4729,4735,4746,4750,4752,4756,4771,4780,4785,4797,4808,4809,4810,4811,4817,4820,4825,4827,4828,4839,4840,4865,4869,4890,4893,4895,4900,4904,4905,4913,4917,4918,4929,4946,4954,4957,4959,4961,4962,4970,4973,4976,4985,4988,4990,4991,4992,4997,5002,5005,5013,5021,5025,5029,5030,5032,5035,5037,5038,5049,5051,5052,5053,5054,5056,5058,5059,5060,5062,5070,5072,5075,5078,5082,5085,5088,5091,5098,5104,5105,5110,5112,5115,5121,5122,5124,5126,5130,5133,5134,5136,5140,5143,5144,5153,5155,5157,5158,5161,5170,5171,5172,5175,5178,5179,5185,5190,5191,5194,5197,5199,5205,5208,5220,5230,5235,5238,5242,5247,5249,5252,5258,5260,5266,5267,5275,5276,5281,5285,5286,5288,5294,5295,5297,5300,5303,5304,5308,5311,5312,5314,5316,5321,5324,5336,5338,5339,5340,5341,5346,5347,5349,5350,5353,5357,5358,5363,5364,5366,5371,5372,5375,5378,5384,5387,5394,5395,5405,5406,5408,5411,5417,5418,5419,5420,5422,5428,5431,5436,5438,5443,5445,5446,5452,5457,5459,5461,5462,5463,5464,5471,5478,5480,5483,5485,5492,5493,5498,5516,5517,5518,5520,5524,5525,5528,5533,5534,5538,5540,5542,5546,5549,5550,5552,5555,5556,5557,5561,5562,5568,5569,5570,5571,5572,5577,5579,5581,5585,5587,5588,5590,5595,5597,5600,5601,5604,5608,5623,5624,5627,5629,5630,5635,5638,5641,5644,5645,5647,5652,5653,5656,5661,5667,5669,5670,5676,5682,5683,5686,5693,5694,5701,5702,5717,5718,5725,5726,5727,5728,5729,5735,5736,5740,5742,5748,5749,5752,5762,5764,5765,5767,5768,5769,5770,5774,5776,5779,5780,5784,5785,5786,5787,5789,5792,5794,5798,5800,5801,5802,5803,5808,5809,5810,5811,5819,5821,5827,5831,5832,5833,5835,5836,5837,5838,5840,5841,5842,5844,5849,5854,5858,5865,5871,5875,5876,5880,5888,5889,5891,5892,5893,5898,5902,5903,5904,5905,5906,5907,5908,5912,5929,5932,5933,5935,5937,5940,5943,5951,5957,5959,5967,5970,5974,5979,5980,5982,5985,5988,5991,5997,5998,5999,6002,6003,6009,6018,6023,6024,6029,6030,6033,6042,6044,6046,6047,6048,6051,6057,6058,6066,6069,6075,6081,6082,6085,6090,6096,6098,6100,6101,6104,6108,6110,6111,6116,6120,6121,6123,6125,6126,6129,6130,6131,6133,6134,6137,6140,6141,6142,6145,6155,6157,6159,6162,6163,6164,6166,6167,6171,6173,6175,6179,6180,6182,6183,6185,6201,6202,6214,6216,6219,6225,6227,6229,6230,6231,6233,6236,6237,6239,6244,6255,6256,6261,6262,6264,6265,6269,6270,6271,6272,6274,6276,6277,6283,6290,6297,6300,6304,6311,6312,6315,6316,6318,6319,6320,6322,6325,6330,6333,6339,6340,6341,6343,6344,6346,6349,6351,6356,6362,6368,6375,6378,6379,6381,6384,6385,6390,6394,6397,6399,6402,6404,6410,6412,6413,6416,6418,6423,6445,6451,6454,6457,6458,6459,6461,6462,6476,6480,6484,6485,6486,6487,6492,6500,6502,6504,6514,6515,6520,6522,6532,6534,6538,6542,6545,6549,6550,6556,6560,6565,6568,6569,6573,6578,6580,6584,6585,6592,6601,6602,6610,6612,6613,6614,6615,6621,6624,6627,6629,6630,6633,6634,6637,6639,6643,6644,6646,6647,6653,6654,6655,6659,6667,6668,6671,6674,6680,6682,6683,6686,6690,6692,6697,6699,6700,6701,6702,6703,6710,6711,6715,6726,6734,6735,6740,6744,6745,6746,6749,6751,6754,6756,6758,6759,6760,6764,6766,6768,6769,6773,6775,6776,6779,6781,6782,6783,6792,6794,6796,6798,6802,6808,6809,6815,6817,6818,6821,6824,6828,6831,6835,6837,6841,6842,6844,6846,6848,6850,6859,6862,6863,6869,6883,6888,6890,6892,6896,6898,6900,6902,6906,6908,6912,6914,6915,6925,6928,6929,6930,6935,6939,6940,6944,6949,6960,6969,6970,6972,6975,6982,6983,6984,6987,6995,7003,7005,7006,7010,7011,7013,7014,7015,7016,7017,7022,7023,7026,7027,7028,7029,7030,7031,7032,7040,7046,7047,7051,7063,7066,7067,7072,7077,7080,7084,7087,7091,7092,7095,7096,7098,7100,7101,7107,7111,7113,7114,7116,7117,7120,7125,7128,7129,7132,7133,7137,7140,7144,7151,7155,7159,7161,7163,7170,7181,7182,7184,7186,7187,7191,7200,7202,7216,7218,7219,7220,7222,7223,7224,7228,7232,7235,7237,7240,7241,7247,7248,7251,7253,7254,7262,7266,7279,7282,7283,7287,7289,7294,7304,7306,7309,7310,7311,7313,7314,7321,7323,7324,7331,7334,7339,7342,7344,7347,7351,7353,7355,7360,7366,7367,7371,7372,7377,7378,7379,7384,7385,7388,7389,7391,7394,7396,7398,7399,7400,7410,7413,7414,7417,7419,7420,7425,7431,7433,7435,7436,7444,7447,7451,7456,7457,7465,7468,7474,7477,7478,7479,7480,7481,7482,7488,7493,7497,7503,7508,7509,7512,7513,7517,7521,7526,7527,7529,7535,7536,7541,7543,7547,7554,7557,7558,7559,7562,7563,7565,7568,7569,7571,7579,7581,7583,7585,7586,7588,7591,7592,7595,7598,7600,7617,7618,7619,7620,7626,7628,7630,7632,7636,7637,7638,7642,7644,7646,7649,7650,7664,7667,7670,7675,7676,7677,7680,7682,7684,7686,7688,7690,7702,7706,7707,7709,7715,7717,7720,7721,7724,7729,7731,7733,7735,7736,7738,7739,7740,7742,7746,7751,7754,7758,7759,7776,7777,7779,7782,7783,7784,7789,7792,7793,7799,7801,7803,7805,7807,7809,7810,7811,7813,7814,7817,7831,7838,7842,7846,7849,7850,7851,7852,7858,7859,7861,7862,7867,7869,7872,7873,7874,7881,7886,7888,7898,7903,7909,7911,7927,7929,7931,7935,7936,7937,7944,7945,7949,7953,7956,7958,7959,7967,7968,7971,7982,7987,7992,7996,8002,8004,8010,8011,8013,8016,8019,8023,8024,8025,8027,8036,8039,8040,8044,8049,8050,8054,8056,8057,8064,8065,8073,8074,8092,8098,8101,8103,8104,8109,8111,8113,8116,8117,8122,8127,8134,8142,8145,8146,8150,8155,8158,8159,8160,8169,8171,8174,8180,8182,8185,8186,8188,8191,8194,8196,8201,8202,8203,8210,8220,8227,8228,8229,8236,8242,8247,8248,8251,8253,8255,8256,8258,8259,8267,8271,8272,8273,8275,8278,8281,8283,8286,8292,8300,8303,8305,8306,8307,8315,8321,8323,8324,8325,8330,8335,8336,8337,8338,8342,8344,8350,8352,8356,8364,8365,8367,8374,8375,8378,8380,8382,8385,8388,8391,8397,8401,8404,8407,8410,8411,8418,8419,8422,8427,8428,8429,8430,8432,8435,8439,8440,8442,8443,8448,8449,8451,8456,8457,8459,8461,8463,8464,8466,8467,8471,8476,8479,8490,8495,8496,8497,8499,8506,8514,8517,8518,8525,8527,8529,8537,8538,8546,8552,8553,8554,8558,8563,8567,8570,8572,8576,8577,8582,8583,8586,8593,8596,8597,8601,8602,8604,8606,8611,8620,8621,8622,8626,8627,8629,8636,8637,8639,8640,8642,8645,8646,8650,8651,8657,8658,8664,8667,8670,8673,8674,8677,8684,8687,8688,8690,8694,8699,8700,8702,8703,8705,8707,8710,8711,8714,8717,8725,8727,8728,8731,8737,8738,8742,8745,8747,8749,8751,8753,8754,8755,8758,8760,8773,8782,8787,8788,8791,8794,8797,8802,8810,8811,8812,8816,8817,8818,8826,8830,8832,8835,8837,8840,8842,8843,8845,8846,8848,8851,8852,8854,8857,8859,8860,8862,8865,8867,8868,8874,8877,8880,8882,8890,8891,8893,8904,8905,8914,8916,8920,8922,8923,8926,8927,8932,8936,8939,8946,8947,8948,8955,8957,8958,8959,8963,8966,8970,8973,8974,8975,8979,8982,8991,8992,8995,8999,9003,9007,9009,9010,9015,9023,9027,9032,9035,9036,9037,9039,9043,9044,9046,9048,9052,9053,9055,9056,9057,9059,9063,9075,9076,9077,9078,9085,9086,9088,9095,9107,9110,9112,9115,9132,9135,9138,9147,9148,9153,9156,9164,9165,9166,9167,9168,9169,9173,9174,9192,9195,9197,9202,9204,9206,9208,9213,9216,9218,9223,9225,9226,9231,9236,9238,9246,9247,9253,9257,9260,9262,9263,9267,9269,9271,9276,9279,9284,9285,9290,9291,9305,9307,9308,9310,9314,9315,9317,9321,9323,9326,9328,9329,9331,9332,9334,9335,9341,9346,9349,9360,9362,9363,9368,9375,9376,9382,9388,9390,9392,9394,9399,9400,9401,9402,9404,9414,9415,9416,9418,9420,9425,9431,9434,9435,9437,9439,9442,9444,9445,9448,9453,9454,9455,9457,9458,9461,9463,9465,9468,9475,9478,9480,9484,9486,9488,9491,9495,9503,9504,9506,9508,9510,9513,9514,9520,9521,9525,9526,9532,9533,9534,9535,9540,9541,9544,9546,9553,9560,9561,9562,9565,9585,9587,9588,9591,9595,9605,9606,9611,9622,9623,9624,9627,9635,9642,9649,9653,9656,9657,9663,9666,9668,9670,9672,9675,9682,9685,9688,9690,9691,9692,9696,9699,9700,9701,9705,9707,9708,9709,9711,9715,9721,9722,9727,9730,9734,9743,9745,9751,9755,9756,9757,9759,9767,9771,9772,9774,9776,9777,9779,9784,9787,9793,9794,9799,9801,9804,9810,9813,9816,9820,9825,9827,9829,9831,9834,9835,9837,9839,9840,9844,9847,9865,9866,9868,9869,9872,9874,9875,9876,9877,9878,9887,9889,9896,9897,9902,9903,9904,9909,9915,9916,9918,9919,9926,9943,9944,9947,9948,9951,9954,9965,9970,9972,9973,9975,9979,9984,9988,9990,9991,9993,9994,9997]
    const {atATime} = taskArgs;
    assert.equal(isNaN(Number(atATime)), false);
    while (sadSeeds.length) {
      let ids = [];
      for (let i = 0; i < Number(atATime); i++) {
        if (!sadSeeds.length) {
          break;
        }
        ids.push(sadSeeds.pop());
      }
      console.log(JSON.stringify(ids));
      await env.run("setSadSeeds", {ids, isSad: true});
      ids = [];
    }
})

task("setSadSeeds", "set the sad seeds for the Paper Pot Contract")
  .addParam("ids", "tokenIds of the seeds to set the emotion property", undefined, types.json)
  .addParam("isSad", "should the seeds be set to sad? If true seeds will be false, else happy", undefined, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const {ids, isSad} = taskArgs;
    const [signer] = await ethers.getSigners();
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, signer);
    const tempSadArr = [];
    const tempBoolArr = [];
    for (const id of ids) {
      // Ensure that id is an integer between 0 and 10000
      assert.equal(isNaN(Number(id)), false);
      assert.equal(id, Math.floor(id));
      assert.equal(id > 0, true);
      assert.equal(id <= 10000, true);
      assert.equal(Boolean(isSad), isSad);
      tempSadArr.push(id);
      tempBoolArr.push(isSad);
    }
    await paperPot.adminSetSadSeeds(tempSadArr, tempBoolArr);
  })

task("mintSeed", "seedContract owner mints an unclaimed seed")
  .addOptionalParam("id", "tokenId of the seed to claim", undefined, types.int)
  .addOptionalParam("ids", "tokenIds of seeds to claim", undefined, types.json)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id, ids } = taskArgs;
    if (!id && !ids) {
      console.log("id or ids must be provided");
      return;
    }
    const tokenIds = ids ? ids : [id];
    const [signer] = await ethers.getSigners();
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    for (const tokenId of tokenIds) {
      console.log(`claiming token ${tokenId}`);
      try {
        await PaperSeed.claimReserve(tokenId);
      } catch (e) {
        console.log(e.message);
        console.log(`error minting tokenId ${tokenId}`);
        console.log("breaking");
        return;
      }
    }
  });

task("sendSeed", "send a seed from the owner contract to an address")
  .addParam("id", "tokenId of the seed to send")
  .addParam("receiver", "address of the receiver")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id, receiver } = taskArgs;
    if (!id) {
      console.log("id is a required param");
      return;
    }
    if (!id) {
      console.log("id is a required param");
      return;
    }
    if (!ethers.utils.isAddress(receiver)) {
      console.log("invalid receiver address");
    }
    const [signer] = await ethers.getSigners();
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    const seedOwner = await PaperSeed.ownerOf(id);
    if (seedOwner !== signer.address) {
      console.log(`this seed is owned by ${seedOwner} - you cannot send it`);
      return;
    }
    const receiverSeeds = await PaperSeed.balanceOf(receiver);
    console.log(`${receiver} currently has ${receiverSeeds} Paper Seeds`);
    console.log(env.network.name);
    if (env.network.name !== 'localhost') {
      const conf = await promptly.confirm(
        `You are about to send tokenId ${id} to ${receiver}. Continue? (y/n)`
      );
      if (!conf) {
        return;
      }
    }
    const tx = await PaperSeed["safeTransferFrom(address,address,uint256)"](
      signer.address,
      receiver,
      id
    );
    console.log(tx.hash);
  });

// task("distributeWater", "distribute water to accounts")
//   .addParam("receivers", "object of acccount/wlSpot pairs ex: {account1: 2, account2: 1}", {}, types.json)
//   .setAction(async (taskArgs, env) => {
//     const { ethers, deployments } = env;
//     const [owner] = await ethers.getSigners();
//     const receivers: {[account: string] : number} = taskArgs.receivers;
//     const accounts = [];
//     const wlSpots = [];
//     for (const [account, receiver] of Object.entries(receivers)) {
//       accounts.push(ethers.utils.getAddress(account));
//       assert.equal(Math.floor(receiver), receiver, "wlSpot must be an integer");
//       assert.equal(receiver >= 0, true, "wlSpot must not be negative");
//       wlSpots.push(receiver);
//     }
//     assert.equal(accounts.length > 0, true, "some wls must be specified");
//     const paperPotDeployment = await deployments.get("PaperPot");
//     const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
//     // await paperPot.adminDistributeWater(owner, amount);
//
//     const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
//     const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
//     await PotNFTTicket.updateWL(tokenId, accounts, wlSpots);
//   })

task("mintWater", "mint new water to an account")
  .addParam("to", "account to mint water to")
  .addParam("amount", "amount of water to mint")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const to = taskArgs.to;
    const amount = taskArgs.amount;
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
    await paperPot.adminDistributeWater(to, amount);
  })

task("mintFertilizer", "mint new fertilizer to an account")
  .addParam("to", "account to mint fertilizer to")
  .addParam("amount", "amount of fertilizer to mint")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const to = taskArgs.to;
    const amount = taskArgs.amount;
    const paperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(paperPotDeployment.address, owner);
    await paperPot.adminDistributeFertilizer(to, amount);
  })

task("getTicketData", "gets the settings for a NFTTicket")
  .addParam("tokenId", "tokenId to change active state for")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    const ticketData = await PotNFTTicket.getTicketData(tokenId);
    console.log(ticketData);
  });

task("activateNFTTicket", "set the active state of an NFTTicket")
  .addParam("tokenId", "tokenId to change active state for")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addParam("active", "whether to set active or not", true, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const active: boolean = taskArgs.active;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateActive(tokenId, active);
  })

task("setRedeemActive", "turn redeeming off or on from the NFT Ticket side")
  .addParam("tokenId", "tokenId to set")
  .addParam("active", "whether redemptions are active", true, types.boolean)
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const active: boolean = taskArgs.active;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateRedeemActive(tokenId, active);
  })

task("updateRedeemEndDate", "update the redemption date for NFT Ticket")
  .addParam("tokenId", "tokenId to set")
  .addParam("redeemEndDate", "Date after which redemptions are not possible")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const date = new Date(taskArgs.redeemEndDate);
    if (date.toString() === 'Invalid Date') {
      console.log('invalid date');
      return;
    }
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateRedeemEndDate(tokenId, toEthDate(date));
  })


task("setPauseNFTTicket", "set the paused state of an NFTTicket")
  .addParam("tokenId", "tokenId to change paused state for")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addParam("paused", "whether to set paused or not", true, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const paused: boolean = taskArgs.paused;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updatePaused(tokenId, paused);
  })

task("initializeNFTTicket", "initialize a ticket for the pot sale")
  .addOptionalParam('controller', 'controller of a particular ticket set', '', types.string)
  .addOptionalParam('recipient', 'account that is paid fees for this ticket', '', types.string)
  .addParam('contractAddress', 'contract address of NFT to be minted at redemption', '', types.string)
  .addOptionalParam('startDate', 'not used yet', '', types.string)
  .addOptionalParam('endDate', 'not used yet', '', types.string)
  .addOptionalParam('mintStartDate', 'start date of the main mint', '', types.string)
  .addOptionalParam('mintEndDate', 'end date of the main mint', '', types.string)
  .addParam('mintPrice', 'ticket price for the main mint in ETH / 1000')
  .addOptionalParam('wlMintStartDate', 'start date of the main mint', '', types.string)
  .addOptionalParam('wlMintEndDate', 'end date of the main mint', '', types.string)
  .addParam('wlMintPrice', 'ticket price for the main mint in ETH / 1000')
  .addOptionalParam('maxPerMint', 'max amount to be minted at a time during the main mint', 10, types.int)
  .addParam('redeemPrice', 'redeem price for ticket in ETH / 1000')
  .addParam('redeemEndDate', 'redeem endDate after which the ticket cannot be redeemed')
  .addParam('maxSupply', 'max number of tickets to be minted during main mint')
  .addOptionalParam('active', 'state of active at initilization', false, types.boolean)
  .addOptionalParam('paused', 'state of paused at initilization', false, types.boolean)
  .addOptionalParam('redeemActive', 'state of redeemActive at initilization', false, types.boolean)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner, signer1] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    // const paperPotDeployment = await deployments.get("PaperPot");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    let now = new Date();
    let oneDayFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 1));
    let twoDaysFromNow = new Date(new Date().setUTCDate(now.getUTCDate() + 2));
    let { controller, recipient, contractAddress, startDate, endDate, mintStartDate, mintEndDate, mintPrice,
      wlMintStartDate, wlMintEndDate, wlMintPrice, maxPerMint, redeemPrice, redeemEndDate, redeemActive, maxSupply, active, paused} = taskArgs
    const ticketData = {
      controller: controller || signer1.address,
      recipient: recipient || signer1.address,
      contractAddress: contractAddress,
      startDate: toEthDate(new Date(startDate)) || toEthDate(now),
      endDate: toEthDate(new Date(endDate)) || toEthDate(oneDayFromNow),
      mintStartDate: toEthDate(new Date(mintStartDate)) || toEthDate(oneDayFromNow),
      mintEndDate: toEthDate(new Date(mintEndDate)) || toEthDate(twoDaysFromNow),
      mintPrice: ethers.constants.WeiPerEther.mul(mintPrice).div(1000),
      wlMintStartDate: toEthDate(new Date(wlMintStartDate)) || toEthDate(now),
      wlMintEndDate: toEthDate(new Date(wlMintEndDate)) || toEthDate(oneDayFromNow),
      wlMintPrice: ethers.constants.WeiPerEther.mul(wlMintPrice).div(1000),
      maxMintAmountPlusOne: maxPerMint + 1,
      redeemPrice: ethers.constants.WeiPerEther.mul(redeemPrice).div(1000),
      redeemEndDate: toEthDate(new Date(redeemEndDate)) || toEthDate(now),
      redeemActive: redeemActive,
      maxSupply: maxSupply,
      active: active,
      paused: paused,
    };
    await PotNFTTicket.initializeTicket(ticketData);
  });

task("setUriTicket")
  .addParam("uri", "uri to set the ticket to")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const uri: string = taskArgs.uri;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    await PotNFTTicket.setUri(uri);
    const newUri = await PotNFTTicket.uri(1);
    console.log(`uri set to ${newUri}`);
  });

task("getUriTicket")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    const newUri = await PotNFTTicket.uri(1);
    console.log(newUri);
  })

// accountWl
task("accountWl")
  .addParam("tokenId", "tokenId to view WL of")
  .addParam("account", "account to view WL of")
  .setAction(async (taskArgs, env) => {
    const tokenId = taskArgs.tokenId;
    const account = taskArgs.account;
    const { ethers, deployments } = env;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, ethers.provider);
    const wls = await PotNFTTicket.accountWl(tokenId, account);
    console.log(wls);
  })

task("setContractUri")
  .addParam("uri", "uri to set the ticket to")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const uri: string = taskArgs.uri;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    await PotNFTTicket.setContractURI(uri);
    const newUri = await PotNFTTicket.contractURI();
    console.log(`uri set to ${newUri}`);
  });

task("getContractUri")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, owner);
    const newUri = await PotNFTTicket.contractURI();
    console.log(newUri);
  })

task("controllerMintTicket")
  .addParam("tokenId", "tokenId of ticket")
  // .addParam("amount", "number to mint")
  .addParam("addresses", "addresses to mint to", [], types.json)
  .addOptionalParam("controller", "address of the controller of the ticket")

  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: string = taskArgs.tokenId;
    // const amount: string = taskArgs.amount;
    const [owner] = await ethers.getSigners();
    const validatedAddresses: string[] = [];
    const amounts: number[] = [];
    for (const address of taskArgs.addresses) {
      validatedAddresses.push(ethers.utils.getAddress(address));
      amounts.push(1);
    }
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    console.log(validatedAddresses);
    console.log(amounts);
    await PotNFTTicket.controllerMint(tokenId, validatedAddresses, amounts);
  });

task("updateNFTTicketMintDates")
  .addParam("tokenId", "tokenId of ticket to update")
  .addOptionalParam("startDate", "new startDate")
  .addOptionalParam("endDate", "new endDate")
  .addOptionalParam("wlStartDate", "new wlStartDate")
  .addOptionalParam("wlEndDate", "new wlEndDate")
  .addOptionalParam("controller", "address of the controller of the ticket")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner] = await ethers.getSigners();
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    for (const param of ['startDate', 'endDate', 'wlStartDate', 'wlEndDate']) {
      console.log(taskArgs[param]);
      if (!taskArgs[param]) {
        continue;
      }
      const date = new Date(taskArgs[param]);
      if (date.toString() === 'Invalid Date') {
        console.log(`invalid ${param}`);
        return;
      }
      const ethDate = toEthDate(date);
      if (param === 'startDate') {
        await PotNFTTicket.updateMintStartDate(tokenId, ethDate);
      } else if (param === 'endDate') {
        await PotNFTTicket.updateMintEndDate(tokenId, ethDate);
      }else if (param === 'wlStartDate') {
        await PotNFTTicket.updateWlMintStartDate(tokenId, ethDate);
      }else if (param === 'wlEndDate') {
        await PotNFTTicket.updateWlMintEndDate(tokenId, ethDate);
      } else {
        throw new Error(`unexpected param - ${param}`);
      }
      console.log(`${param} updated to ${date.toISOString()}`);
    }
    // const startDate = new Date(taskArgs.startDate);
    // if (startDate.toString() === 'Invalid Date') {
    //   console.log('invalid date');
    //   return;
    // }
    // const ethStartDate = toEthDate(startDate);
    // const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    // await PotNFTTicket.updateMintStartDate(tokenId, ethStartDate);
  });

task("updateNFTTicketWL")
  .addParam("tokenId", "tokenId to update the whitelist for")
  .addParam("wls", "object of acccount/wlSpot pairs ex: {account1: 2, account2: 1}", {}, types.json)
  .addOptionalParam("controller", "address of the controller of the ticket")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const [owner, account1, account2, account3, account4 ] = await ethers.getSigners();
    const wls: {[account: string] : number} = taskArgs.wls;
    const controller = taskArgs.controller ? await ethers.getSigner(taskArgs.controller) : owner;
    if (Object.keys(wls).length === 0) {
      wls[owner.address] = 1;
      wls[account1.address] = 2;
      wls[account2.address] = 3;
      wls[account3.address] = 4;
    }
    const accounts = [];
    const wlSpots = [];
    for (const [account, wlSpot] of Object.entries(wls)) {
      accounts.push(ethers.utils.getAddress(account));
      assert.equal(Math.floor(wlSpot), wlSpot, "wlSpot must be an integer");
      assert.equal(wlSpot >= 0, true, "wlSpot must not be negative");
      wlSpots.push(wlSpot);
    }
    assert.equal(accounts.length > 0, true, "some wls must be specified");
    const potNFTTicketDeployment = await deployments.get("PotNFTTicket");
    const PotNFTTicket = PotNFTTicket__factory.connect(potNFTTicketDeployment.address, controller);
    await PotNFTTicket.updateWL(tokenId, accounts, wlSpots);
  })

task("unpausePot", "unpause minting for paper Pot")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.unpauseMinting();
  })

task("pausePot", "pause minting for paper Pot")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.pauseMinting();
  })

task("setNftTicketInfo", "set the address and tokenId for the NFTTicket")
  .addParam("tokenId", "tokenId to change paused state for")
  .addParam("address", "address of the NFTTicket contract")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const tokenId: number = taskArgs.tokenId;
    const address: string = taskArgs.address;
    const [owner] = await ethers.getSigners();
    const PaperPotDeployment = await deployments.get("PaperPot");
    const paperPot = PaperPot__factory.connect(PaperPotDeployment.address, owner);
    await paperPot.setNftTicketInfo(tokenId, address);
  })

task(
  "getOrphanageRegistered",
  "list of registered accounts who have signed up for the adoption program"
).setAction(async (taskArgs, env) => {
  const { ethers, deployments } = env;
  const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
  const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
    orphanageDeploymentV2.address,
    ethers.provider
  );
  const registeredAccounts = await SeedOrphanageV2.getRegister();
  console.log(JSON.stringify(registeredAccounts.map((r) => r.toLowerCase())));
});

task(
  "getOrphanageSeeds",
  "list of seeds up for adoption in the orphanage"
).setAction(async (taskArgs, env) => {
  const { ethers, deployments } = env;
  const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
  const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
    orphanageDeploymentV2.address,
    ethers.provider
  );
  const registeredAccounts = await SeedOrphanageV2.getSeeds();
  console.log(JSON.stringify(registeredAccounts.map((bn) => bn.toNumber())));
});

task("supplyOrphanage", "send seeds to be adopted")
  .addParam("ids", "array of tokenIds to fund contract with", [], types.json)
  .setAction(async (taskArgs, env) => {
    function setTimeoutAsync(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const { ethers, deployments } = env;
    const { ids } = taskArgs;
    if (!ids) {
      console.log("ids is a required param");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // Check that all of the tokenIds are owned
    let ownershipCheckFailed = false;
    for (const tokenId of ids) {
      const owner = await PaperSeed.ownerOf(tokenId);
      if (owner !== signer.address) {
        console.log(
          `tokenId ${tokenId} is owner by ${owner}, not ${signer.address}`
        );
        ownershipCheckFailed = true;
      }
    }
    if (ownershipCheckFailed) {
      console.log("FAILURE: seeds were not delivered");
      return;
    }
    const isApproved = await PaperSeed.isApprovedForAll(
      signer.address,
      SeedOrphanageV2.address
    );
    if (!isApproved) {
      // if not approved - then approve the orphanage for transferring the seeds
      await PaperSeed.setApprovalForAll(SeedOrphanageV2.address, true);
    }
    // Loop through the tokenIds and send them.
    for (const tokenId of ids) {
      console.log(`adding seed with tokenId ${tokenId}`);
      const tx = await SeedOrphanageV2.addSeed(tokenId);
      console.log(tx.hash);
      await setTimeoutAsync(1000);
    }
    await env.run("getOrphanageSeeds");
  });

task("emptyOrphanage", "reclaim seeds from orphanage")
  .addParam("id")
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id } = taskArgs;
    if (!id) {
      console.log("id is a required param");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // Ensure that the seed is owned by the orphanage
    const ownerOfSeed = await PaperSeed.ownerOf(id);
    if (ownerOfSeed !== SeedOrphanageV2.address) {
      console.log(
        `tokenId ${id} not in orphanage address: ${SeedOrphanageV2.address}`
      );
      return;
    }
    const tx = await SeedOrphanageV2.removeSeed(id);
    console.log(tx.hash);
    await env.run("getOrphanageSeeds");
  });

task("deliverSeeds", "send seeds to adoptive gardeners")
  .addParam("id", "tokenId of the seed", undefined, types.int)
  .addParam("receiver", "address of the receiver", "", types.string)
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { id: tokenId, receiver } = taskArgs;
    if (!tokenId) {
      console.log("id is a required param");
      return;
    }
    if (!receiver) {
      console.log("receiver is a required param");
      return;
    }
    // validate the receiver address
    if (!ethers.utils.isAddress(receiver)) {
      console.log("receiver address is not valid");
      return;
    }
    const [signer] = await ethers.getSigners();
    const orphanageDeploymentV2 = await deployments.get("SeedOrphanageV2");
    const seedDeployment = await deployments.get("PaperSeed");
    const SeedOrphanageV2 = SeedOrphanageV2__factory.connect(
      orphanageDeploymentV2.address,
      signer
    );
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    // validate that this tokenId is owned by the orphanage
    const ownerOf = await PaperSeed.ownerOf(tokenId);
    if (ownerOf !== SeedOrphanageV2.address) {
      console.log(`tokenId ${tokenId} is not owned by the orphanage contract`);
      return;
    }
    // validate that the receiver is a seed holder
    const seedCount = await PaperSeed.balanceOf(receiver);
    if (seedCount.eq(0)) {
      console.log(`account ${receiver} has no seeds, and is thus ineligible`);
      return;
    }
    // final confirmation
    const conf = await promptly.confirm(
      `You are about to deliver seed with tokenId ${tokenId} to ${receiver}. Continue? (y/n)`
    );
    if (!conf) {
      return;
    }
    console.log("sending seed");
    const tx = await SeedOrphanageV2.deliver(tokenId, receiver);
    console.log(`seed with tokenId ${tokenId} delivered in tx ${tx.hash}`);
    console.log(`remaining seeds`);
    await env.run("getOrphanageSeeds");
  });

task("mintUnclaimed", "seedContract owner mints the unclaimed seeds")
  .addParam(
    "unclaimedFile",
    "json file with unclaimed tokenIds",
    null,
    types.string
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { unclaimedFile } = taskArgs;
    if (!unclaimedFile) {
      console.log("unclaimedFile is a required param");
      return;
    }
    function setTimeoutAsync(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const unclaimed = JSON.parse(readFileSync(unclaimedFile, "utf-8"));
    const [signer] = await ethers.getSigners();
    console.log(signer.address);
    const seedDeployment = await deployments.get("PaperSeed");
    const PaperSeed = PaperSeed__factory.connect(
      seedDeployment.address,
      signer
    );
    for (const tokenId of unclaimed) {
      console.log(`claiming token ${tokenId}`);
      try {
        const tx = await PaperSeed.claimReserve(tokenId);
      } catch (e) {
        console.log(e.message);
        if (e.message === "transaction underpriced") {
          await setTimeoutAsync(10000);
          const tx = await PaperSeed.claimReserve(tokenId);
        } else {
          throw e;
        }
      }
      await setTimeoutAsync(500);
    }
  });

task("distribMatic", "distribute MATIC")
  .addOptionalParam("amount", "number of MATIC to distribute", 1.0, types.float)
  .addOptionalParam(
    "count",
    "number of accounts to distribute MATIC to",
    6,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { amount, count } = taskArgs;
    const [account0, ...signers] = await ethers.getSigners();
    const masterBalance = await account0.getBalance();
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterBalance
      )} MATIC`
    );
    const ethPerAccount = ethers.utils.parseUnits(amount.toString());
    const ethRequired = ethPerAccount.mul(count);
    console.log(
      `about to distribute ${amount} MATIC to ${count} accounts for a total of ${ethers.utils.formatEther(
        ethRequired
      )} MATIC`
    );
    if (masterBalance.lt(ethRequired)) {
      throw new Error("insufficient balance");
    }
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} MATIC to ${
          account.address
        }`
      );
      await account0.sendTransaction({
        to: account.address,
        value: ethPerAccount,
      });
    }
    const account0Balance = await account0.getBalance();
    console.log("final MATIC balances:");
    console.log(
      `${account0.address}: ${ethers.utils.formatEther(account0Balance)}`
    );
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      const accountBalance = await account.getBalance();
      console.log(
        `${account.address}: ${ethers.utils.formatEther(accountBalance)}`
      );
    }
  });

task("distribTestToken", "distribute sUSDC and sMATIC")
  .addOptionalParam(
    "amount",
    "number of tokens to distribute",
    1000,
    types.float
  )
  .addOptionalParam(
    "count",
    "number of accounts to distribute MATIC to",
    6,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const { amount, count } = taskArgs;
    const [account0, ...signers] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const shrubExchange = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    let shrubExchangeConnect = ShrubExchange__factory.connect(
      shrubExchangeDeployment.address,
      account0
    );
    let susdConnect = SUSDToken__factory.connect(
      susdTokenDeployment.address,
      account0
    );
    let smaticConnect = SMATICToken__factory.connect(
      smaticTokenDeployment.address,
      account0
    );

    const masterBalance = await account0.getBalance();
    const masterSusdBalance = await susdConnect.balanceOf(account0.address);
    const masterSmaticBalance = await smaticConnect.balanceOf(account0.address);
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterBalance
      )} MATIC`
    );
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterSusdBalance
      )} sUSD`
    );
    console.log(
      `master account ${account0.address} has ${ethers.utils.formatEther(
        masterSmaticBalance
      )} sMATIC`
    );

    const ethPerAccount = ethers.utils.parseUnits(amount.toString());
    const ethRequired = ethPerAccount.mul(count);
    console.log(
      `about to distribute ${amount} sMATIC and sUSD to ${count} accounts for a total of ${ethers.utils.formatEther(
        ethRequired
      )} sMATIC and sUSD`
    );
    if (
      masterSmaticBalance.lt(ethRequired) ||
      masterSmaticBalance.lt(ethRequired)
    ) {
      throw new Error("insufficient balance");
    }
    for (let i = 0; i < count; i++) {
      const account = signers[i];
      shrubExchangeConnect = shrubExchangeConnect.connect(account0);
      susdConnect = susdConnect.connect(account0);
      smaticConnect = smaticConnect.connect(account0);

      // Transfer funds to other accounts
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} sUSD to ${
          account.address
        }`
      );
      await susdConnect.transfer(account.address, ethPerAccount, {
        gasLimit: 100000,
      });
      console.log(
        `sending ${ethers.utils.formatEther(ethPerAccount)} sMATIC to ${
          account.address
        }`
      );
      await smaticConnect.transfer(account.address, ethPerAccount, {
        gasLimit: 100000,
      });

      // Approve for deposit into Shrub
      shrubExchangeConnect = shrubExchangeConnect.connect(account);
      susdConnect = susdConnect.connect(account);
      smaticConnect = smaticConnect.connect(account);
      console.log("checking if sUSD is approved for deposit into shrub");
      const susdAllowance = await susdConnect.allowance(
        account.address,
        shrubExchangeConnect.address
      );
      if (susdAllowance.lt(1000)) {
        console.log("approving sUSD for deposit into shrub");
        await susdConnect.approve(
          shrubExchangeConnect.address,
          ethers.BigNumber.from(1e6).mul(ethers.constants.WeiPerEther),
          { gasLimit: 100000 }
        );
      }
      console.log("checking if sMATIC is approved for deposit into shrub");
      const smaticAllowance = await smaticConnect.allowance(
        account.address,
        shrubExchangeConnect.address
      );
      if (smaticAllowance.lt(1000)) {
        console.log("approving sMATIC for deposit into shrub");
        await smaticConnect.approve(
          shrubExchangeConnect.address,
          ethers.BigNumber.from(1e6).mul(ethers.constants.WeiPerEther),
          { gasLimit: 100000 }
        );
      }

      // Deposit into Shrub
      console.log(
        `depoisting ${ethers.utils.formatEther(
          ethPerAccount
        )} sUSD into Shrub from ${account.address}`
      );
      await shrubExchangeConnect.deposit(susdConnect.address, ethPerAccount, {
        gasLimit: 100000,
      });
      console.log(
        `depoisting ${ethers.utils.formatEther(
          ethPerAccount
        )} sMATIC into Shrub from ${account.address}`
      );
      await shrubExchangeConnect.deposit(smaticConnect.address, ethPerAccount, {
        gasLimit: 100000,
      });

      const sUsdShrubBalance = await shrubExchangeConnect.getAvailableBalance(
        account.address,
        susdConnect.address
      );
      const sMaticShrubBalance = await shrubExchangeConnect.getAvailableBalance(
        account.address,
        smaticConnect.address
      );
      console.log(
        `Total Shrub Balances for ${
          account.address
        }: sUSD: ${ethers.utils.formatEther(
          sUsdShrubBalance
        )} sMATIC: ${ethers.utils.formatEther(sMaticShrubBalance)}`
      );
    }
  });

task(
  "fundAccounts",
  "deposits MATIC and SUSD into first two accounts",
  async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const weiInEth = ethers.BigNumber.from(10).pow(18);
    const tenEth = ethers.BigNumber.from(10).mul(weiInEth);
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const shrubExchange = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );

    // ensure that susdToken deploy is confirmed
    // await susdToken.deployTransaction.wait();
    await (
      await susdToken.approve(
        shrubExchange.address,
        ethers.BigNumber.from(100000).mul(weiInEth)
      )
    ).wait();
    await susdToken.transfer(
      account1.address,
      ethers.BigNumber.from(1000).mul(weiInEth)
    );
    const susdBalance0 = await susdToken.balanceOf(account0.address);
    const susdBalance1 = await susdToken.balanceOf(account1.address);

    // Deposit 10 MATIC and 500 SUSD in the shrubExchange
    // Ensure that shrubExchange is deployed
    // await shrubExchange.deployTransaction.wait();
    await shrubExchange.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchange.deposit(
      susdToken.address,
      ethers.BigNumber.from(85000).mul(weiInEth)
    );

    // Setup contracts for account1
    const susdTokenAcct1 = susdToken.connect(account1);
    const shrubExchangeAcct1 = shrubExchange.connect(account1);
    await (
      await susdTokenAcct1.approve(
        shrubExchange.address,
        ethers.BigNumber.from(10000).mul(weiInEth)
      )
    ).wait();
    await shrubExchangeAcct1.deposit(ethers.constants.AddressZero, tenEth, {
      value: tenEth,
    });
    await shrubExchangeAcct1.deposit(
      susdToken.address,
      ethers.BigNumber.from(500).mul(weiInEth)
    );

    console.log(`ShrubContractAddress: ${shrubExchange.address}`);
    console.log(`SUSDContractAddress: ${susdToken.address}`);
  }
);

task("maker2", "creates limit orders")
  .addOptionalParam("count", "number of orders to generate", 100, types.int)
  .addOptionalParam(
    "baseIv",
    "the centered IV for the generator",
    125,
    types.float
  )
  .addOptionalParam(
    "ivRange",
    "maximum deviation from the baseIv",
    50,
    types.float
  )
  .addOptionalParam("ethPrice", "price of MATIC in USD", 1.5, types.float)
  .addOptionalParam(
    "riskFreeRate",
    "annual risk free rate of return (0.05 means 5%)",
    0.05,
    types.float
  )
  .setAction(async (taskArgs, env) => {
    console.log("running");
    const { ethers, deployments, web3 } = env;
    const [master, account0, account1, account2, account3, account4, account5] =
      await ethers.getSigners();
    const accounts = [
      account0,
      account1,
      account2,
      account3,
      account4,
      account5,
    ];

    const STRIKE_BASE_SHIFT = 1e6;
    const { count, baseIv, ivRange, ethPrice, riskFreeRate } = taskArgs;
    const WeiInEth = ethers.constants.WeiPerEther;
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    let shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account0
    );
    const shrubInterface = new Shrub712(17, shrubExchangeDeployment.address);
    const priceFeedMatic = new ethers.Contract(
      CHAINLINK_MATIC,
      chainlinkAggregatorV3Interface,
      account0
    );
    const client = new ApolloClient({
      link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/jguthrie7/shrub",
        fetch,
      }),
      cache: new InMemoryCache(),
    });

    function generateRandomOrder(
      expiry: number,
      strikeUsdcMillion: number,
      optionType: string,
      maticPrice: number,
      isBuy: boolean
    ) {
      const strikeUsdc = strikeUsdcMillion / STRIKE_BASE_SHIFT;
      const timeToExpiry =
        (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000);
      const volatility =
        ((isBuy ? -1 : 1) * Math.random() * ivRange + baseIv) / 100;
      // console.log(`
      //   MATIC price: ${maticPrice}
      //   strike: ${strikeUsdc}
      //   time to expiry (years): ${timeToExpiry}
      //   volatility: ${volatility}
      //   risk free rate: ${riskFreeRate}
      // `)
      const strike = ethers.BigNumber.from(strikeUsdcMillion);
      const sizeEth = Math.floor(Math.random() * 5) + 1;
      const size = ethers.BigNumber.from(sizeEth).mul(WeiInEth);
      const pricePerContractUsdc =
        Math.round(
          10000 *
          bs.blackScholes(
            maticPrice,
            strikeUsdc,
            timeToExpiry,
            volatility,
            riskFreeRate,
            optionType.toLowerCase()
          )
        ) / 10000;
      if (timeToExpiry < 0 || pricePerContractUsdc < 0.0002) {
        return null;
      }
      const price = ethers.BigNumber.from(
        Math.round(pricePerContractUsdc * 10000)
      )
        .mul(WeiInEth.div(ethers.BigNumber.from(10000)))
        .mul(size)
        .div(WeiInEth);
      const fee = ethers.BigNumber.from(Math.floor(Math.random() * 100));
      const smallOrder: SmallOrder = {
        size,
        isBuy,
        nonce: 0,
        price,
        fee,
        offerExpire:
          Math.floor((new Date().getTime() + 60 * 1000 * 60 * 3.5) / 1000) +
          Math.floor(Math.random() * 60 * 60), // 3.5 - 4.5 hours from now
      };
      const common: OrderCommon = {
        baseAsset: susdToken.address,
        quoteAsset: smaticToken.address,
        expiry,
        strike,
        optionType: optionType === "CALL" ? 1 : 0,
      };
      return { smallOrder, common };
    }

    const maticPriceBig = await priceFeedMatic.latestRoundData();
    const maticPrice = Number(
      ethers.utils.formatUnits(maticPriceBig.answer, 8)
    );
    const orderTypeHash = await shrubContractAccount.ORDER_TYPEHASH();

    return new Promise((resolve, reject) => {
      setInterval(() => {
        return main()
          .then((count) =>
            console.log(
              `${new Date().toLocaleString()} - ${count} orders added`
            )
          )
          .catch(reject);
      }, MINUTES_BETWEEN_ORDERS * 60 * 1000);

      async function main() {
        let count = 0;
        for (const account of accounts) {
          shrubContractAccount = shrubContractAccount.connect(account);
          let queryResults;
          try {
            queryResults = await client.query({
              query: ACTIVE_ORDERS_QUERY,
              variables: {
                id: account.address.toLowerCase(),
                now: Math.floor(Date.now() / 1000),
              },
            });
          } catch (e) {
            console.log(e);
            if (e && e.statusCode) {
              console.log(`Subgraph issue: response ${e.statusCode}`);
            }
            console.log("stopping this iteration");
            break;
          }
          const activeOptions =
            queryResults && queryResults.data && queryResults.data.options;
          const activeOptionsWithOrders = activeOptions.filter(
            (o) => o.buyOrders.length || o.sellOrders.length
          );
          for (const expiryDate of expiryDates) {
            for (const optionType of ["CALL", "PUT"]) {
              const strikes = optionType === "CALL" ? callsArr : putsArr;
              for (const strike of strikes) {
                for (const isBuy of [true, false]) {
                  // Look for matching existing order
                  const alreadyAnOrder = Boolean(
                    activeOptionsWithOrders.find((o) => {
                      return (
                        o.expiry === expiryDate.getTime() / 1000 &&
                        o.optionType === optionType &&
                        Number(o.strike) ===
                        Number(ethers.utils.formatUnits(strike, 6)) &&
                        (isBuy
                          ? Boolean(o.buyOrders[0])
                          : Boolean(o.sellOrders[0]))
                      );
                    })
                  );
                  if (alreadyAnOrder) {
                    continue;
                  }
                  console.log(
                    new Date().toLocaleString(),
                    account.address,
                    expiryDate.toLocaleString(),
                    optionType,
                    ethers.utils.formatUnits(strike, 6),
                    isBuy,
                    alreadyAnOrder ? " - Skipping" : ""
                  );
                  const randomOrder = generateRandomOrder(
                    expiryDate.getTime() / 1000,
                    strike,
                    optionType,
                    maticPrice,
                    isBuy
                  );
                  if (!randomOrder) {
                    console.log("skipping because no order");
                    continue;
                  }
                  const { smallOrder, common } = randomOrder;
                  if (!smallOrder || !common) {
                    console.log("skipping because no smallOrder or common");
                    continue;
                  }
                  try {
                    const nonce = await shrubContractAccount[
                      "getCurrentNonce(address,(address,address,uint256,uint256,uint8))"
                      ](account.address, common);
                    //  Overwrite nonce
                    smallOrder.nonce = nonce.toNumber() + 1;
                    const signedSellOrder =
                      await shrubInterface.signOrderWithWeb3(
                        web3,
                        orderTypeHash,
                        {
                          size: smallOrder.size.toString(),
                          price: smallOrder.price.toString(),
                          fee: smallOrder.fee.toNumber(),
                          strike: common.strike.toString(),
                          ...smallOrder,
                          ...common,
                        },
                        account.address
                      );
                    await shrubContractAccount.announce(
                      smallOrder,
                      common,
                      signedSellOrder.sig,
                      { gasLimit: 50000 }
                    );
                  } catch (e) {
                    console.log(e);
                    continue;
                  }
                  count++;
                }
              }
            }
          }
        }
        return count;
      }
    });
  });

task("cancel", "cancel all orders for an account").setAction(
  async (taskArgs, env) => {
    const { ethers, deployments } = env;
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account0
    );
    const hashUtilDeployment = await deployments.get("HashUtil");
    const hashUtilDeployed = await ethers.getContractAt(
      "HashUtil",
      hashUtilDeployment.address
    );
    const hashUtil = HashUtil__factory.connect(
      hashUtilDeployed.address,
      account0
    );
    const client = new ApolloClient({
      link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/jguthrie7/shrub",
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    // Query to see current state of things
    console.log(account0.address);
    const queryResults = await client.query({
      query: ACTIVE_ORDERS_QUERY,
      variables: {
        id: account0.address.toLowerCase(),
        now: Math.floor(Date.now() / 1000),
      },
    });
    const activeOptions =
      queryResults && queryResults.data && queryResults.data.options;
    for (const activeOption of activeOptions) {
      const {
        expiry,
        optionType,
        strike,
        baseAsset,
        quoteAsset,
        buyOrders,
        sellOrders,
      } = activeOption;
      if (buyOrders && buyOrders[0]) {
        console.log(
          `cancelling order for buy ${new Date(
            expiry * 1000
          ).toLocaleString()} ${optionType} ${strike}`
        );
        const { nonce, size, price, offerExpire, fee } = buyOrders[0];
        try {
          // const filter = await shrubContractAccount.queryFilter()
          const order = {
            size: ethers.utils.parseUnits(size),
            isBuy: true,
            nonce: nonce,
            price: ethers.utils.parseUnits(price),
            offerExpire: offerExpire,
            fee: ethers.utils.parseUnits(fee),
            baseAsset: baseAsset.id,
            quoteAsset: quoteAsset.id,
            expiry: expiry,
            strike: ethers.utils.parseUnits(strike, 6),
            optionType: optionType === "CALL" ? 1 : 0,
          };
          // console.log(order);
          // const positionHash = await hashUtil.hashOrderCommon(order)
          // console.log(positionHash);
          const cancel = await shrubContractAccount.cancel(order);
          console.log(cancel);
        } catch (e) {
          console.log("cancel failed");
          console.log(e);
        }
      }
      if (sellOrders && sellOrders[0]) {
        console.log(
          `cancelling order for sell ${new Date(
            expiry * 1000
          ).toLocaleString()} ${optionType} ${strike}`
        );
        const { nonce, size, price, offerExpire, fee } = sellOrders[0];
        try {
          // const filter = await shrubContractAccount.queryFilter()
          const order = {
            size: ethers.utils.parseUnits(size),
            isBuy: false,
            nonce: nonce,
            price: ethers.utils.parseUnits(price),
            offerExpire: offerExpire,
            fee: ethers.utils.parseUnits(fee),
            baseAsset: baseAsset.id,
            quoteAsset: quoteAsset.id,
            expiry: expiry,
            strike: ethers.utils.parseUnits(strike, 6),
            optionType: optionType === "CALL" ? 1 : 0,
          };
          // console.log(order);
          // const positionHash = await hashUtil.hashOrderCommon(order)
          // console.log(positionHash);
          const cancel = await shrubContractAccount.cancel(order);
          console.log(cancel);
        } catch (e) {
          console.log("cancel failed");
          console.log(e);
        }
      }
    }

    // Loop through expiries
    // Loop through Call/Put
    // Loop through strikes
    // Loop through Buy/Sell
  }
);

task("maker", "creates limit orders")
  .addOptionalParam("count", "number of orders to generate", 100, types.int)
  .addOptionalParam(
    "baseIv",
    "the centered IV for the generator",
    125,
    types.float
  )
  .addOptionalParam(
    "ivRange",
    "maximum deviation from the baseIv",
    50,
    types.float
  )
  .addOptionalParam("ethPrice", "price of MATIC in USD", 1.5, types.float)
  .addOptionalParam(
    "riskFreeRate",
    "annual risk free rate of return (0.05 means 5%)",
    0.05,
    types.float
  )
  .setAction(async (taskArgs, env) => {
    console.log(taskArgs);
    const STRIKE_BASE_SHIFT = 1e6;
    const { count, baseIv, ivRange, ethPrice, riskFreeRate } = taskArgs;
    const { ethers, deployments, web3 } = env;
    const WeiInEth = ethers.constants.WeiPerEther;
    const [account0, account1] = await ethers.getSigners();
    const shrubExchangeDeployment = await deployments.get("ShrubExchange");
    const susdTokenDeployment = await deployments.get("SUSDToken");
    const smaticTokenDeployment = await deployments.get("SMATICToken");
    const shrubExchangeDeployed = await ethers.getContractAt(
      "ShrubExchange",
      shrubExchangeDeployment.address
    );
    const susdToken = await ethers.getContractAt(
      "SUSDToken",
      susdTokenDeployment.address
    );
    const smaticToken = await ethers.getContractAt(
      "SMATICToken",
      smaticTokenDeployment.address
    );
    const shrubInterface = new Shrub712(17, shrubExchangeDeployment.address);

    function getRandomArrayElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomContract() {
      // const contractNumber = Math.floor(Math.random() * optionContracts.length);
      // return optionContracts[contractNumber];
      const optionType = Math.random() > 0.5 ? "CALL" : "PUT";
      const expiry = Number(getRandomArrayElement(expiryDates)) / 1000;
      const strike =
        optionType === "CALL"
          ? getRandomArrayElement(callsArr)
          : getRandomArrayElement(putsArr);
      return { optionType, expiry, strike };
    }

    function generateRandomOrder() {
      const {
        expiry,
        strike: strikeUsdcMillion,
        optionType,
      } = getRandomContract();
      const strikeUsdc = strikeUsdcMillion / STRIKE_BASE_SHIFT;
      const timeToExpiry =
        (expiry * 1000 - Date.now()) / (365 * 24 * 60 * 60 * 1000);
      const isBuy = Math.random() * 100 > 50;
      const volatility =
        ((isBuy ? -1 : 1) * Math.random() * ivRange + baseIv) / 100;
      console.log(`
          MATIC price: ${ethPrice}
          strike: ${strikeUsdc}
          time to expiry (years): ${timeToExpiry}
          volatility: ${volatility}
          risk free rate: ${riskFreeRate}
        `);
      const strike = ethers.BigNumber.from(strikeUsdcMillion);
      const sizeEth = Math.floor(Math.random() * 5) + 1;
      const size = ethers.BigNumber.from(sizeEth).mul(WeiInEth);
      const pricePerContractUsdc =
        Math.round(
          10000 *
          bs.blackScholes(
            ethPrice,
            strikeUsdc,
            timeToExpiry,
            volatility,
            riskFreeRate,
            optionType.toLowerCase()
          )
        ) / 10000;
      if (timeToExpiry < 0) {
        return null;
      }
      const price = ethers.BigNumber.from(
        Math.round(pricePerContractUsdc * 10000)
      )
        .mul(WeiInEth.div(ethers.BigNumber.from(10000)))
        .mul(size)
        .div(WeiInEth);
      const fee = ethers.BigNumber.from(Math.floor(Math.random() * 100));
      const smallOrder: SmallOrder = {
        size,
        isBuy,
        nonce: 0,
        price,
        fee,
        offerExpire: Math.floor(
          (new Date().getTime() + 60 * 1000 * 60 * 24) / 1000
        ),
      };
      const common: OrderCommon = {
        baseAsset: susdToken.address,
        quoteAsset: smaticToken.address,
        expiry,
        strike,
        optionType: optionType === "CALL" ? 1 : 0,
      };
      return { smallOrder, common };
    }

    const account = account0;
    const shrubContractAccount = ShrubExchange__factory.connect(
      shrubExchangeDeployed.address,
      account
    );
    const orderTypeHash = await shrubContractAccount.ORDER_TYPEHASH();

    for (let i = 0; i < count; i++) {
      const randomOrder = generateRandomOrder();
      if (!randomOrder) {
        continue;
      }
      const { smallOrder, common } = randomOrder;
      if (!smallOrder || !common) {
        continue;
      }
      const nonce = await shrubContractAccount[
        "getCurrentNonce(address,(address,address,uint256,uint256,uint8))"
        ](account.address, common);
      //  Overwrite nonce
      smallOrder.nonce = nonce.toNumber() + 1;
      console.log(orderTypeHash, smallOrder, account.address, common);
      const signedSellOrder = await shrubInterface.signOrderWithWeb3(
        web3,
        orderTypeHash,
        {
          size: smallOrder.size.toString(),
          price: smallOrder.price.toString(),
          fee: smallOrder.fee.toNumber(),
          strike: common.strike.toString(),
          ...smallOrder,
          ...common,
        },
        account.address
      );
      await shrubContractAccount.announce(
        smallOrder,
        common,
        signedSellOrder.sig,
        { gasLimit: 50000 }
      );
    }
  });

task("faucet", "initializes faucet with SUSD and SMATIC")
  .addOptionalParam(
    "susdAmount",
    "amount of SUSD to add to faucet",
    1e7,
    types.int
  )
  .addOptionalParam(
    "smaticAmount",
    "amount of SMATIC to add to faucet",
    1e7,
    types.int
  )
  .addOptionalParam(
    "susdRate",
    "how many SUSD to sell/buy for 1 MATIC",
    10000,
    types.int
  )
  .addOptionalParam(
    "smaticRate",
    "how many SMATIC to sell/buy for 1 MATIC",
    10000,
    types.int
  )
  .setAction(async (taskArgs, env) => {
    const { susdAmount, smaticAmount, susdRate, smaticRate } = taskArgs;
    const { ethers, deployments } = env;

    const [account0] = await ethers.provider.listAccounts();

    const sUSDDeployment = await deployments.get("SUSDToken");
    const sMATICDeployment = await deployments.get("SMATICToken");
    const tfDeployment = await deployments.get("TokenFaucet");

    const sUsd = await ethers.getContractAt(
      "SUSDToken",
      sUSDDeployment.address
    );
    const sMatic = await ethers.getContractAt(
      "SMATICToken",
      sMATICDeployment.address
    );
    const faucet = await ethers.getContractAt(
      "TokenFaucet",
      tfDeployment.address
    );

    await sMatic.approve(account0, faucet.address);
    await sUsd.approve(account0, faucet.address);
    await faucet.addToken(sMatic.address, smaticRate);
    await faucet.addToken(sUsd.address, susdRate);
    await sMatic.transfer(
      faucet.address,
      ethers.constants.WeiPerEther.mul(smaticAmount)
    );
    await sUsd.transfer(
      faucet.address,
      ethers.constants.WeiPerEther.mul(susdAmount)
    );
  });
