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
export const TotalSeedsInTreasury = gql`
  query SeedsInTreasury {
    users(where: { id: "0xbcfe78a91b6968322ed1b08fbe3a081353487910" }) {
      seedCount
    }
  }
`;
export const SeedsTypeTreasury = gql`
  query SeedsTypeTreasury($id: String, $value: String) {
    users(where: { id: $id }) {
      seeds(where: { type: $value }, first: 1000) {
        type
      }
    }
  }
`;

export const SeedsClaim = gql`
  query seedsClaim {
    typeStats {
      id
      claimed
    }
  }
`;
