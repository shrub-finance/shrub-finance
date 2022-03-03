import { addressMap } from "../constants/dictionary";

const dictionary: { [address: string]: string } = addressMap;

export default function useTruncateAddress(address: string) {
  // Captures 0x + 4 characters, then the last 4 characters.
  const truncateRegex = /^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

  /**
   * Source: https://github.com/gpxl-dev/truncate-eth-address
   * Truncates an ethereum address to the format 0x00…0000
   */
  if (dictionary[address]) {
    return dictionary[address];
  }
  const match = address.match(truncateRegex);
  if (!match) {
    return address;
  }
  return `${match[1]}…${match[2]}`;
}
