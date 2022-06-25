"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var func = function (hre) {
  return __awaiter(this, void 0, void 0, function () {
    var deployments,
      getNamedAccounts,
      deploy,
      deployer,
      paperSeedDeployment,
      paperSeedAddress,
      paperPotMetadataDeployment,
      metadataGenerator,
      seedContractAddresses,
      resourceUris,
      sadSeeds;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          (deployments = hre.deployments),
            (getNamedAccounts = hre.getNamedAccounts);
          deploy = deployments.deploy;
          return [4 /*yield*/, getNamedAccounts()];
        case 1:
          deployer = _a.sent().deployer;
          return [4 /*yield*/, deployments.get("PaperSeed")];
        case 2:
          paperSeedDeployment = _a.sent();
          paperSeedAddress = paperSeedDeployment.address;
          return [4 /*yield*/, deployments.get("PaperPotMetadata")];
        case 3:
          paperPotMetadataDeployment = _a.sent();
          metadataGenerator = paperPotMetadataDeployment.address;
          seedContractAddresses = [paperSeedAddress];
          resourceUris = [
            "ipfs://QmT7oAx22fyN43tj175yb9rNGeCbfQ4yM8ugtLKDFNv1P2",
            "ipfs://QmeSQknfvE6U8T1MiGZfBDE8wezP5EyqgxBQB958AQqkFR",
            "ipfs://QmWkMGo4a9YtKAtZ556o4zn9ZtGz2rGV1MWyCBgNcvm3TH", // water
          ];
          sadSeeds = [
            16, 25, 163, 219, 250, 2164, 2166, 2170, 2174, 2181, 2185, 2186,
            2188,
          ];
          //   constructor(
          //     address[] memory seedContractAddresses,
          //     uint[] memory sadSeeds,
          //     string[] memory resourceUris_,
          //     string[] memory shrubDefaultUris_,
          //     address metadataGenerator_
          // ) ERC1155("") {
          return [
            4 /*yield*/,
            deploy("PaperPot", {
              from: deployer,
              // args: [seedContractAddresses, sadSeeds, resourceUris, shrubDefaultImageUris, metadataGenerator],
              args: [
                seedContractAddresses,
                sadSeeds,
                resourceUris,
                metadataGenerator,
              ],
              log: true,
            }),
          ];
        case 4:
          //   constructor(
          //     address[] memory seedContractAddresses,
          //     uint[] memory sadSeeds,
          //     string[] memory resourceUris_,
          //     string[] memory shrubDefaultUris_,
          //     address metadataGenerator_
          // ) ERC1155("") {
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
};
exports.default = func;
func.id = "deploy_paper_pot"; // id to prevent re-execution
func.tags = ["PaperPot"];
