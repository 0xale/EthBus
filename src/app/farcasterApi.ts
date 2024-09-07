import { init, fetchQuery } from "@airstack/node";

// Initialize Airstack with your API key
init("1a58580e20332418c9e985cdcf71b8bac");

const FARCASTER_QUERY = `
query GetFarcasterFollowerCount($address: Identity!) {
  Socials(
    input: {
      filter: {
        dappName: { _eq: farcaster }
        identity: { _eq: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 }
      }
      blockchain: ALL
    }
  ) {
    Social {
      followerCount
    }
  }
}
`;

export async function getFarcasterFollowerCount(address: string): Promise<number | null> {
  try {
    const { data, error } = await fetchQuery(FARCASTER_QUERY, { address });

    if (error) {
      console.error("Error fetching Farcaster data:", error);
      return null;
    }

    const social = data?.Socials?.Social?.[0];
    if (social && typeof social.followerCount === 'number') {
      return social.followerCount;
    }

    return null;
  } catch (error) {
    console.error("Error in getFarcasterFollowerCount:", error);
    return null;
  }
}

// Example usage
async function main() {
  const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Example address
  const followerCount = await getFarcasterFollowerCount(address);
  console.log(`Follower count for ${address}: ${followerCount}`);
}

main().catch(console.error);