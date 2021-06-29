import { IOrder } from "../types";
import axios from "axios";
import useFetch from "../hooks/useFetch";

// TODO: this should also use useFetch hook, just pass method:"post" as param useFetch(url, {method: "post", params});
export function postOrder(signedOrder: IOrder) {
  return axios.post(`${process.env.REACT_APP_API_ENDPOINT}/orders`, signedOrder);
}

export async function GetOrders({
  quoteAsset,
  baseAsset,
  expiry,
}: Partial<IOrder>) {
  const params = { quoteAsset, baseAsset, expiry };
  const url = `${process.env.REACT_APP_API_ENDPOINT}/orders`;
  const {error, data, status} = useFetch<IOrder[]>(url, {params});
  if (data && status === 'fetched' && !error) {
    const orders: IOrder[] = data;
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
  } else if (error) {
      console.log(error);
      return;
  }


}
