import { gql } from '@apollo/client'

export const SUMMARY_VIEW_QUERY = gql`
    query SummaryView($expiry: [Int], $optionType: OptionType, $baseAsset: String, $quoteAsset: String, $offerExpire: Int, $id: String) {
        options(where: {expiry_in: $expiry, baseAsset: $baseAsset, quoteAsset: $quoteAsset}, orderBy: strike, orderDirection: asc) {
            name
            strike
            expiry
            optionType
            id
            lastPrice
            buyOrders(where: {tradable: true, offerExpire_gt: $offerExpire, userOption_starts_with: $id}, orderBy: nonce, orderDirection: desc, first: 1) {
                pricePerContract
                nonce
                size
                id
            }
        }
    }
`

export const ACTIVE_ORDERS_QUERY = gql`
    query getActiveOrders($id: String, $now: Int) {
        options(where: {expiry_gt: $now}) {
            baseAsset{id}
            quoteAsset{id}
            expiry
            strike
            optionType
            buyOrders(where: {tradable: true, offerExpire_gt: $now, userOption_starts_with: $id}, orderBy: nonce, orderDirection: desc, first: 1) {
                pricePerContract
                nonce
                size
                id
                price
                offerExpire
                fee
            }
            sellOrders(where: {tradable: true, offerExpire_gt: $now, userOption_starts_with: $id}, orderBy: nonce, orderDirection: desc, first: 1) {
                pricePerContract
                nonce
                size
                id
                price
                offerExpire
                fee
            }
        }
    }
`
