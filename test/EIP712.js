class EIP712Generator {
  constructor(types, domain) {
    this.types = types;
    this.domain = domain;
    this.template = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
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
      message
    }
  }

  getSha3Message(types, message) {
    return types.map(t => ({t: t.type, v: message[t.name], name: t.name}));
  }
}
    /*
     *const orderTypeHash = await web3.utils.soliditySha3("Order(uint size, address signer, bool isBuy, uint nonce, uint price, uint offerExpire, uint fee, address baseAsset, address quoteAsset, uint expiry, uint strike, OptionType optionType)");
     */
 
const types = {
  Order: [
    { name: 'size', type: 'uint' },
    { name: 'isBuy', type: 'bool' },
    { name: 'nonce', type: 'uint' },
    { name: 'price', type: 'uint' },
    { name: 'offerExpire', type: 'uint' },
    { name: 'fee', type: 'uint' },
    { name: 'baseAsset', type: 'address' },
    { name: 'quoteAsset', type: 'address' },
    { name: 'expiry', type: 'uint' },
    { name: 'strike', type: 'uint' },
    { name: 'optionType', type: 'uint8' },
  ]
};

const domain = {
  name: 'Shrub.finance',
  version: '1',
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
    super.get712Body(message, 'Order');
  }

  getOrderSha3Message(orderTypeHash, message) {
    const orderMessage = super.getSha3Message(this.types.Order, message);
    const sha3Message = [{t: 'bytes32', v: orderTypeHash }, ...orderMessage];
    console.log(sha3Message);
    return sha3Message;
  }
}



module.exports = { Shrub712 };
