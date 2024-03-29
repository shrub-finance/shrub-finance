import { gql } from "@apollo/client";

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

export const SEED_ADOPTION_QUERY = gql`
  query SeedAdoption($numResults: Int) {
    adoptionRecords(
      first: $numResults
      orderBy: timestamp
      orderDirection: desc
    ) {
      seed {
        name
        type
      }
      user {
        id
      }
      timestamp
    }
  }
`;

export const REGISTERED_SIBLINGS_QUERY = gql`
  query RegisteredSiblings($dnas: [Int], $registered: [String]) {
    seeds(where: { dna_in: $dnas, owner_in: $registered }) {
      id
      dna
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

export const MY_GARDENS_QUERY = gql`
  query MyGardens($user: String) {
    _meta {
      block {
        number
      }
    }
    user(id: $user) {
      ticketCount
      waterCount
      fertilizerCount
      potCount
      pottedPlants {
        id
        growth
        lastWatering
        lastClaim
        seed {
          name
          dna
          emotion
          type
        }
      }
      shrubNfts {
        id
        name
        uri
        pottedPlant {
          id
          seed {
            type
            emotion
            dna
          }
        }
      }
    }
    seeds(where: { owner: $user }) {
      id
      name
      dna
      emotion
      type
    }
  }
`;

export const SEED_OWNERSHIP_QUERY = gql`
  query SeedOwnership($address: String) {
    user(id: $address) {
      seeds {
        id
        type
        name
        emotion
        dna
        born
        bornBlock
      }
    }
  }
`;

export const GARDENS_STATS_QUERY = gql`
  query Stats {
    typeStats {
      virgin
      unmoved
      treasury
      planted
      id
      harvested
      claimed
      circulation
      burned
    }
    pottedPlants(
      orderBy: growth
      orderDirection: desc
      where: { growth_gt: 0, growth_lt: 10000 }
    ) {
      id
      growth
      owner {
        id
      }
      uri
    }
    users(where: { potCount_gt: "0" }) {
      potCount
    }
  }
`;
