class EIP712Generator {
  constructor(types, domain) {
    this.types = types;
    this.domain = domain;
    this.template = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        ...types,
      },
      domain: domain,
    };
  }

  get712Body(message, primaryType) {
    return {
      ...this.template,
      primaryType,
      message,
    };
  }

  getSha3Message(types, message) {
    return types.map((t) => ({ t: t.type, v: message[t.name], name: t.name }));
  }
}
/*
 *const orderTypeHash = await web3.utils.soliditySha3("Order(uint size, address signer, bool isBuy, uint nonce, uint price, uint offerExpire, uint fee, address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)");
 */

const types = {
  Order: [
    { name: "size", type: "uint" },
    { name: "isBuy", type: "bool" },
    { name: "nonce", type: "uint" },
    { name: "price", type: "uint" },
    { name: "offerExpire", type: "uint" },
    { name: "fee", type: "uint" },
    { name: "baseAsset", type: "address" },
    { name: "quoteAsset", type: "address" },
    { name: "expiry", type: "uint" },
    { name: "strike", type: "uint" },
    { name: "optionType", type: "uint8" },
  ],
  SmallOrder: [
    { name: "size", type: "uint" },
    { name: "isBuy", type: "bool" },
    { name: "nonce", type: "uint" },
    { name: "price", type: "uint" },
    { name: "offerExpire", type: "uint" },
    { name: "fee", type: "uint" },
    { name: "baseAsset", type: "address" },
    { name: "quoteAsset", type: "address" },
    { name: "expiry", type: "uint" },
    { name: "strike", type: "uint" },
    { name: "optionType", type: "uint8" },
  ],
  OrderCommon: [
    { name: "baseAsset", type: "address" },
    { name: "quoteAsset", type: "address" },
    { name: "expiry", type: "uint" },
    { name: "strike", type: "uint" },
    { name: "optionType", type: "uint8" },
  ],
};

const domain = {
  name: "Shrub.finance",
  version: "1",
};

class Shrub712 extends EIP712Generator {
  constructor(chainId = 1, verifyingContract) {
    super(types, {
      ...domain,
      chainId,
      verifyingContract,
    });
  }

  get712Body(message) {
    super.get712Body(message, "Order");
  }

  getTypeSha3Message(typeName, typehash, message) {
    const orderMessage = super.getSha3Message(this.types[typeName], message);
    const sha3Message = [{ t: "bytes32", v: typehash }, ...orderMessage];
    return sha3Message;
  }

  getOrderSha3Message(typehash, message) {
    return this.getTypeSha3Message("Order", typehash, message);
  }

  getSmallOrderSha3Message(typehash, message) {
    return this.getTypeSha3Message("SmallOrder", typehash, message);
  }

  getOrderCommonSha3Message(typehash, message) {
    return this.getTypeSha3Message("OrderCommon", typehash, message);
  }

  toOrder(order) {
    const obj = { ...order };
    const common = this.types.OrderCommon.map((t) => t.name);
    const orderKeys = this.types.Order.map((t) => t.name);
    for (const key in obj) {
      if (!orderKeys.includes(key) && !common.includes(key)) {
        delete obj[key];
      }
    }
    return obj;
  }

  toSmallOrder(order) {
    const obj = { ...order };
    const common = this.types.OrderCommon.map((t) => t.name);
    const smallOrder = this.types.SmallOrder.map((t) => t.name);
    for (const key in obj) {
      if (!smallOrder.includes(key) || common.includes(key)) {
        delete obj[key];
      }
    }
    return obj;
  }

  toCommon(order) {
    const obj = { ...order };
    const common = this.types.OrderCommon.map((t) => t.name);
    for (const key in obj) {
      if (!common.includes(key)) {
        delete obj[key];
      }
    }
    return obj;
  }

  async signOrderWithWeb3(web3, orderTypeHash, order, account) {
    const filteredOrder = this.toOrder(order);
    const sha3Message = this.getOrderSha3Message(orderTypeHash, filteredOrder);
    const hash = await web3.utils.soliditySha3(...sha3Message);
    const signature = await web3.eth.sign(hash, account);

    const sig = signature.slice(2);
    const r = "0x" + sig.substr(0, 64);
    const s = "0x" + sig.substr(64, 64);
    const v = web3.utils.toDecimal("0x" + sig.substr(128, 2));
    return { order, sig: { v, r, s } };
  }
}

module.exports = { Shrub712 };
