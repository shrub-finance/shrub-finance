import { gql } from "@apollo/client";

export const SUMMARY_VIEW_ALL_QUERY = gql`
  query SummaryViewAll(
    $expiries: [Int]
    $optionTypes: [OptionType]
    $baseAsset: String
    $quoteAsset: String
    $offerExpire: Int
  ) {
    options(
      where: {
        expiry_in: $expiries
        optionType_in: $optionTypes
        baseAsset: $baseAsset
        quoteAsset: $quoteAsset
      }
      orderBy: strike
      orderDirection: asc
    ) {
      expiry
      optionType
      strike
      id
      lastPrice
      sellOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: asc
        first: 1
      ) {
        pricePerContract
        option {
          id
        }
        userOption {
          user {
            id
          }
        }
      }
      buyOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: desc
        first: 1
      ) {
        pricePerContract
        option {
          id
        }
        userOption {
          user {
            id
          }
        }
      }
    }
  }
`;

export const ORDER_DETAILS_QUERY = gql`
  query OrderDetails(
    $positionHash: String
    $offerExpire: Int
    $account: String
  ) {
    option(id: $positionHash) {
      id
      name
      strike
      lastPrice
      sellOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: asc
      ) {
        pricePerContract
        size
        id
        userOption {
          user {
            id
          }
        }
        block
      }
      buyOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: desc
      ) {
        pricePerContract
        size
        id
        userOption {
          user {
            id
          }
        }
        block
      }
    }
  }
`;

export const OPTION_POSITION_QUERY = gql`
  query OptionPositionQuery($id: String) {
    userOption(id: $id) {
      balance
    }
  }
`;

export const SUMMARY_VIEW_QUERY = gql`
  query SummaryView(
    $expiry: Int
    $optionType: OptionType
    $baseAsset: String
    $quoteAsset: String
    $offerExpire: Int
  ) {
    options(
      where: {
        expiry: $expiry
        optionType: $optionType
        baseAsset: $baseAsset
        quoteAsset: $quoteAsset
      }
      orderBy: strike
      orderDirection: asc
    ) {
      name
      strike
      id
      lastPrice
      sellOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: asc
      ) {
        pricePerContract
        size
        id
        option {
          id
        }
        userOption {
          user {
            id
          }
        }
        block
      }
      buyOrders(
        where: { tradable: true, offerExpire_gt: $offerExpire }
        orderBy: pricePerContract
        orderDirection: desc
      ) {
        pricePerContract
        size
        id
        option {
          id
        }
        userOption {
          user {
            id
          }
        }
        block
      }
    }
  }
`;

export const TOKEN_DATA_QUERY = gql`
  query TokenData {
    tokens {
      id
      symbol
      name
      decimals
    }
  }
`;

export const ORDER_HISTORY_QUERY = gql`
  query OrderHistory($id: ID) {
    _meta {
      block {
        number
      }
    }
    user(id: $id) {
      id
      userOptions(orderBy: nonce, orderDirection: desc) {
        option {
          id
          baseAsset {
            symbol
          }
          quoteAsset {
            symbol
          }
          expiry
          strike
          optionType
          lastPrice
        }
        buyOrders(orderBy: nonce, orderDirection: desc) {
          id
          pricePerContract
          size
          tradable
          fullyMatched
          matches {
            size
          }
          funded
          expiredNonce
          offerExpire
          block
          timestamp
        }
        sellOrders(orderBy: nonce, orderDirection: desc) {
          id
          pricePerContract
          size
          tradable
          fullyMatched
          matches {
            size
          }
          funded
          expiredNonce
          block
          offerExpire
          timestamp
        }
      }
    }
  }
`;

// export const SHRUBFOLIO_QUERY = gql`
//     query Shrubfolio($id: ID){
//         user(id:$id){
//             id
//             tokenBalances{
//                 token{symbol}
//                 unlockedBalance
//                 lockedBalance
//                 block
//             }
//             userOptions{
//                 balance
//                 option{
//                     baseAsset{symbol}
//                     quoteAsset{symbol}
//                     expiry
//                     strike
//                     optionType
//                     lastPrice
//                 }
//                 buyOrders(where:{fullyMatched:true}){
//                     pricePerContract
//                     size
//                 }
//                 sellOrders(where:{fullyMatched:true}){
//                     pricePerContract
//                     size
//                 }
//             }
//         }
//     }
// `

export const SHRUBFOLIO_QUERY = gql`
  query Shrubfolio($id: ID) {
    _meta {
      block {
        number
      }
    }
    user(id: $id) {
      activeUserOptions(
        where: { balance_not: 0 }
        orderBy: balance
        orderDirection: desc
      ) {
        balance
        option {
          id
          baseAsset {
            symbol
            id
          }
          quoteAsset {
            symbol
            id
          }
          expiry
          strike
          optionType
          lastPrice
        }
        buyOrders(where: { fullyMatched: true }) {
          size
          price
          pricePerContract
          tradable
          fullyMatched
          matches {
            id
            block
            size
            finalPrice
            finalPricePerContract
            totalFee
            sellOrder {
              userOption {
                user {
                  id
                }
              }
            }
          }
        }
        sellOrders(where: { fullyMatched: true }) {
          size
          price
          pricePerContract
          tradable
          fullyMatched
          matches {
            id
            block
            size
            finalPrice
            finalPricePerContract
            totalFee
            buyOrder {
              userOption {
                user {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const ORDER_BOOK_QUERY = gql`
  query OrderBook($id: ID) {
    option(id: $id) {
      baseAsset {
        symbol
      }
      quoteAsset {
        symbol
      }
      strike
      expiry
      optionType
      lastPrice
      buyOrders {
        size
        nonce
        pricePerContract
        expiredNonce
        funded
        offerExpire
        fee
        block
        timestamp
        fullyMatched
        matches {
          id
        }
      }
      sellOrders {
        id
        size
        nonce
        pricePerContract
        expiredNonce
        funded
        offerExpire
        fee
        block
        timestamp
        fullyMatched
        matches {
          id
        }
      }
    }
  }
`;

export const META_QUERY = gql`
  {
    _meta {
      hasIndexingErrors
      block {
        hash
        number
      }
    }
  }
`;

export const NFT_LEADERBOARD_QUERY = gql`
  query NFTLeaderboard($numResults: Int, $b: [String]) {
    users(
      first: $numResults
      orderBy: seedCount
      orderDirection: desc
      where: { id_not_in: $b }
    ) {
      id
      seedCount
      seeds {
        type
      }
    }
  }
`;
