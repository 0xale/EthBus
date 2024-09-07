"use client";
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  createPublicClient,
  http,
  formatEther,
  Address,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import contractABI from '../Contract/FactoryABI.json';
import socialTokenABI from '../Contract/SocialTokenABI.json';

import { useConnectModal } from '@rainbow-me/rainbowkit';

const UserTokens: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [tokenDetails, setTokenDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { openConnectModal } = useConnectModal();

  const factoryAddress: Address = '0x5338B0Fa96fD3C7e76dafbD6F27Ca1EFb06E14fe'; // Replace with your SocialTokenFactory contract address

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  useEffect(() => {
    const fetchUserTokens = async () => {
      if (isConnected && address) {
        try {
          const tokens = await publicClient.readContract({
            address: factoryAddress,
            abi: contractABI,
            functionName: 'getUserTokens',
            args: [address],
          });
          setUserTokens(tokens as string[]);
        } catch (error) {
          console.error('Error fetching user tokens:', error);
        }
      }
    };

    fetchUserTokens();
  }, [isConnected, address]);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (userTokens.length > 0) {
        const details = await Promise.all(
          userTokens.map(async (tokenAddress) => {
            try {
              const [name, symbol, basePrice, totalSupply] = await Promise.all([
                publicClient.readContract({
                  address: tokenAddress as Address,
                  abi: socialTokenABI,
                  functionName: 'name',
                }),
                publicClient.readContract({
                  address: tokenAddress as Address,
                  abi: socialTokenABI,
                  functionName: 'symbol',
                }),
                publicClient.readContract({
                  address: tokenAddress as Address,
                  abi: socialTokenABI,
                  functionName: 'basePrice',
                }),
                publicClient.readContract({
                  address: tokenAddress as Address,
                  abi: socialTokenABI,
                  functionName: 'totalSupply',
                }),
              ]);

              return {
                address: tokenAddress,
                name,
                symbol,
                basePrice: formatEther(basePrice as bigint),
                totalSupply: formatEther(totalSupply as bigint),
              };
            } catch (error) {
              console.error(`Error fetching details for token ${tokenAddress}:`, error);
              return null;
            }
          })
        );

        setTokenDetails(details.filter((detail) => detail !== null));
        setIsLoading(false);
      }
    };

    fetchTokenDetails();
  }, [userTokens]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Personal Tokens</h1>
        <button
          onClick={openConnectModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Your Personal Tokens</h1>

      {isLoading ? (
        <p className="text-center text-gray-700">Loading your tokens...</p>
      ) : tokenDetails.length === 0 ? (
        <p className="text-center text-gray-700">You haven't created any personal tokens yet.</p>
      ) : (
        <div className="space-y-6">
          {tokenDetails.map((token, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">{token.name} ({token.symbol})</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Contract Address:</span> {token.address}</p>
                <p><span className="font-semibold">Base Price:</span> {token.basePrice} ETH</p>
                <p><span className="font-semibold">Total Supply:</span> {token.totalSupply} {token.symbol}</p>
              </div>
              
                {/* <a href={`/token/${token.address}`}
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View Token Details
              </a> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTokens;