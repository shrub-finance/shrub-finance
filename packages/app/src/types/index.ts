import {BigNumber} from "ethers";

export type PutCall = 'PUT' | 'CALL';

export type SellBuy = 'SELL' | 'BUY';

export type OrderType = 'Market' | 'Limit';

export type PendingStatuses = 'pending'|'confirming'|'confirmed'|'failed'

export type BinaryNumber = 0 | 1;

export type PendingTxState = {[txHash: string]: { description: string, status: PendingStatuses, created: Date, updated: Date}}

export type LastOrders = {[positionHash: string]: number}

export type PendingTxAction = { type: 'add'|'update'|'clear', txHash?: string, description?: string, status?: PendingStatuses}

export type SupportedCurrencies = 'MATIC'|'SUSD'

export type SmallOrder = {
  size: BigNumber;
  isBuy: boolean;
  nonce: number;
  price: BigNumber;
  offerExpire: number;
  fee: BigNumber;
}

export type OrderCommon = {
  baseAsset: string;
  quoteAsset: string;
  expiry: number;
  strike: BigNumber;
  optionType: BinaryNumber;
}

export type GetOrdersParams = Modify<Partial<OrderCommon>, {
  strike?: string
}> & {
  isBuy?: boolean;
}

export type Signature = {
  v: number;
  r: string;
  s: string;
}

export type UnsignedOrder = OrderCommon & SmallOrder;

export type IOrder = UnsignedOrder & Signature & {
  address: string;
}

export type ApiOrder = Modify<IOrder, {
  strike: { $numberDecimal: string };
  size: { $numberDecimal: string };
  price: { $numberDecimal: string };
  fee: { $numberDecimal: string };
}>

export type PostOrder = Modify<IOrder, {
  strike: string;
  size: string;
  price: string;
  fee: string;
}>

export type AppCommon = Modify<OrderCommon, {
  expiry: Date;
  optionType: PutCall;
}> & {
  formattedExpiry: string;
  formattedStrike: string;
}

export type AppSmall = {
  formattedSize: string;
  optionAction: SellBuy;
  nonce: number;
  unitPrice: number;
  offerExpire: Date;
  formattedFee: string;
}

export type AppOrder = AppCommon & AppSmall & {
  address?: string;
  size: BigNumber;
  totalPrice: BigNumber;
  fee: BigNumber;
}

export type AppOrderSigned = AppOrder & Signature;

export type IndexedAppOrderSigned = AppOrderSigned & {
  transactionHash: string;
}

export type OrderbookStats = {
  bestAsk: string;
  bestBid: string;
  last: string;
}

export type Balance = { [currency: string]: string };

export type ShrubBalance = {
  locked: {[currency: string]: number},
  available: {[currency: string]: number}
};

export type ContractData = {
  [optionPair: string ] : ContractInnerData
}

export type ContractInnerData = {
  [expiry: string] : {
    [optionType: string] : [strike: number]
  }
}

export type OrderBook = {
    buyOrders: AppOrderSigned[];
    sellOrders: AppOrderSigned[];
}

export type IndexedAppOrderSignedNumbered = IndexedAppOrderSigned & {
  blockNumber: number
}

export type UserOrdersState = {[transactionHash: string]: IndexedAppOrderSignedNumbered}

export type UserOrdersAction = { type: 'add', order: IndexedAppOrderSignedNumbered}

export type OptionData = {
  buyOrdersIndexed: {[positionHash: string]: IndexedAppOrderSigned};
  sellOrdersIndexed: {[positionHash: string]: IndexedAppOrderSigned};
  buyOrders: IndexedAppOrderSigned[];
  sellOrders: IndexedAppOrderSigned[];
  last: string;
  ask?: number;
  bid?: number;
}

export type OrderBookState = {
  [quoteAsset : string]: {
    [baseAsset : string]: {
      [expiry: string]: {
        [optionType: string]: {
          [strike: string]: OptionData;
        };
      };
    };
  };
};

// export type OrderBookAction = { type: 'add'|'update'|'clear', txHash?: string, description?: string, status?: PendingStatuses}
export type OrderBookAction = { type: 'add', orders: IndexedAppOrderSigned[]}

export type Stringify<Type> = {
  [Property in keyof Type]: string;
}


// https://stackoverflow.com/questions/41285211/overriding-interface-property-type-defined-in-typescript-d-ts-file/65561287#65561287

type ModifyDeep<A extends AnyObject, B extends DeepPartialAny<A>> = {
  [K in keyof A]: B[K] extends never
      ? A[K]
      : B[K] extends AnyObject
          ? ModifyDeep<A[K], B[K]>
          : B[K]
} & (A extends AnyObject ? Omit<B, keyof A> : A)

/** Makes each property optional and turns each leaf property into any, allowing for type overrides by narrowing any. */
type DeepPartialAny<T> = {
  [P in keyof T]?: T[P] extends AnyObject ? DeepPartialAny<T[P]> : any
}

type AnyObject = Record<string, any>

type Modify<T, R> = Omit<T, keyof R> & R;
