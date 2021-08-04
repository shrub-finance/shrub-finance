import {ApiOrder, IOrder, PostOrder, Stringify} from "../types";
import axios from "axios";

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

export function postOrder(signedOrder: PostOrder) {
  try {
    return axios.post(`${API_ENDPOINT}/orders`, signedOrder);
  } catch (e) {
    console.log(e);
  }

}

export async function getOrders({
  quoteAsset,
  baseAsset,
  expiry,
}: Partial<IOrder>) {
  try {
    const params = { quoteAsset, baseAsset, expiry };
    let response;
    try {
      response = await axios.get(`${API_ENDPOINT}/orders`, { params });
    } catch (e) {
      throw e;
    }
    const { data, status } = response;
    if (status !== 200) {
      throw new Error("unable to get orders");
    }
    const orders: [ApiOrder] = data;
    const now = Number(new Date());
    const order = orders.find((o) => {
      return (
          o.expiry &&
          o.expiry * 1000 > now &&
          o.offerExpire &&
          o.offerExpire * 1000 > now &&
          !o.isBuy
      );
    });
    return order;

  } catch (e) {
    console.log(e);
  }

}

export async function getSpecificOrderbook({quoteAsset, baseAsset, expiry, optionType, strike, isBuy}: Partial<Stringify<ApiOrder>>) {
  const url = `${API_ENDPOINT}/orders`
  const params = { quoteAsset, baseAsset, expiry, optionType, strike, isBuy };
  const orderbook = await axios.get(url, {params});
  console.log(orderbook);
  return orderbook;
}
