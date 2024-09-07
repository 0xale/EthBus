"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  parseEther,
  formatEther,
  createPublicClient,
  http,
  createWalletClient,
  custom,
  Address,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import contractABI from '../Contract/SocialTokenABI.json';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';

interface BuyTokenProps {
  token: string | null;
}

const BuyToken: React.FC<BuyTokenProps> = ({ token }) => {
  // ... [Keep all the existing state variables and functions]
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [farcasterFollowers, setFarcasterFollowers] = useState<number | null>(null);
  const { openConnectModal } = useConnectModal();
  const [basePrice, setBasePrice] = useState<string>('');
  const [priceIncreasePerToken, setPriceIncreasePerToken] = useState<string>('');
  const [priceIncreasePer100Followers, setPriceIncreasePer100Followers] = useState<string>('');
  const [minDiscount, setMinDiscount] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('');

  const contractAddress = params.token as Address;

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  useEffect(() => {
    
    const fetchContractData = async () => {
      console.log("calling")
      if (publicClient && contractAddress) {
        try {
          const [
            fetchedBasePrice,
            fetchedPriceIncreasePerToken,
            fetchedPriceIncreasePer100Followers,
            fetchedMinDiscount,
            fetchedMaxDiscount,
            fetchedSymbol,
            fetchedName,
            userBalance,
            totalSupply,
          ] = await Promise.all([
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'basePrice',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'priceIncreasePerToken',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'priceIncreasePer100Followers',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'minBonus',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'maxBonus',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'name',
            }),
           
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'balanceOf',
              args: [address!],
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'totalSupply',
            }),
          ]);

          setBasePrice(formatEther(fetchedBasePrice as bigint));
          setPriceIncreasePerToken(formatEther(fetchedPriceIncreasePerToken as bigint));
          setPriceIncreasePer100Followers(formatEther(fetchedPriceIncreasePer100Followers as bigint));
          setMinDiscount(formatEther(fetchedMinDiscount as bigint));
          setMaxDiscount(formatEther(fetchedMaxDiscount as bigint));
          setSymbol(fetchedSymbol as string);
          setName(fetchedName as string);
          setTokenBalance(formatEther(userBalance as bigint));
          setTotalSupply(formatEther(totalSupply as bigint));
        } catch (error) {
          console.error('Error fetching contract data:', error);
        }
      }
    };
    fetchContractData();
  },[address])


  useEffect(() => {
    const fetchPrice = async () => {
      if (amount && publicClient && contractAddress) {
        try {
          const priceData = await publicClient.readContract({
            address: contractAddress,
            abi: contractABI,
            functionName: 'getPrice',
            args: [parseEther(amount), 0],
          });
          setCalculatedPrice(formatEther(priceData as bigint));
        } catch (error) {
          console.error('Error fetching price:', error);
        }
      }
    };

    fetchPrice();
  }, [amount, publicClient, contractAddress]);
 

  const handleBuy = async () => {
    if (!isConnected) {
      openConnectModal;
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    
    try {
      const walletClient = createWalletClient({
        chain: {
          id: 84532,
          name: 'Base Sepolia',
          network: 'base-sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'Base Sepolia Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ["https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw"],
            },
            public: {
              http: ["https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw"],
            },
          },
        },
        transport: custom(window.ethereum),
      });

      if (walletClient && publicClient && contractAddress && address) {
        console.log("the amount",parseEther(amount));
        const { request } = await publicClient.simulateContract({
          account: address,
          address: contractAddress,
          abi: contractABI,
          functionName: 'buyTokens',
          args: [parseEther(amount), 0],
          value: parseEther(calculatedPrice),
        });
        const hash = await walletClient.writeContract(request);
        console.log(hash);
        setAmount('');
        setSuccessMessage('Transaction sent successfully!');
      }
    } catch (error) {
      console.error('Error buying tokens:', error);
      setErrorMessage('Failed to purchase tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto p-6 max-w-4xl"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        {name} Token Purchase
      </h1>

       
        <div className="bg-white shadow-2xl rounded-lg p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="space-y-4 text-gray-700"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <InfoItem title="Contract Address" value={contractAddress} />
              <InfoItem title="Total Supply" value={`${totalSupply} ${symbol}`} />
              <InfoItem title={`Your ${symbol} Token Balance`} value={`${tokenBalance} ${symbol}`} />
              <InfoItem title="Farcaster Followers" value={farcasterFollowers !== null ? farcasterFollowers : 'Loading...'} />
              <InfoItem title="Base Price" value={`${basePrice} ETH`} />
            </motion.div>
            <motion.div 
              className="space-y-4 text-gray-700"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <InfoItem title="Price Increase Per Token" value={`${priceIncreasePerToken} ETH`} />
              <InfoItem title="Price Increase Per 100 Followers" value={`${priceIncreasePer100Followers} ETH`} />
              <InfoItem title="Min Bonus" value={`${minDiscount}%`} />
              <InfoItem title="Max Bonus" value={`${maxDiscount}%`} />
            </motion.div>
          </div>

          <motion.div 
            className="space-y-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount of tokens to buy"
                className="flex-grow border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                onClick={handleBuy}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
              >
                {isLoading ? 'Buying...' : 'Buy Token'}
              </button>
            </div>
            {calculatedPrice && (
              <p className="text-xl font-semibold text-gray-800 text-center">
                Estimated Price: {calculatedPrice} ETH
              </p>
            )}
            {successMessage && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-center font-semibold"
              >
                {successMessage}
              </motion.p>
            )}
            {errorMessage && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-center font-semibold"
              >
                {errorMessage}
              </motion.p>
            )}
          </motion.div>
        </div>
    
    </motion.div>
  );
};

interface InfoItemProps {
  title: string;
  value: string | number; // Adjust this type based on what 'value' could be.
}

const InfoItem: React.FC<InfoItemProps> = ({ title, value }) => (
  <div className="flex flex-col space-y-1">
    <p className="font-semibold text-gray-600">{title}:</p>
    <p className="text-gray-900">{value}</p>
  </div>
);


export default BuyToken;