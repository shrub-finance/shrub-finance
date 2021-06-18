import { IOrder } from "../types";
import axios from "axios";

const API_ENDPOINT = "http://localhost:8000";

export function postOrder(signedOrder: IOrder) {
  return axios.post(`${API_ENDPOINT}/orders`, signedOrder);
}

export async function getOrders({
  quoteAsset,
  baseAsset,
  expiry,
}: Partial<IOrder>) {
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
  const orders: [IOrder] = data;
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
}
