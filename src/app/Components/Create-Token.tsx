"use client";
import React, { useState } from 'react';
import { createPublicClient, http, createWalletClient, custom, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import contractABI from '../Contract/FactoryABI.json';
import { motion } from 'framer-motion';

const contractAddress = '0x5338B0Fa96fD3C7e76dafbD6F27Ca1EFb06E14fe';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const CreateToken: React.FC = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceIncreasePerToken, setPriceIncreasePerToken] = useState('');
  const [priceIncreasePer100Followers, setPriceIncreasePer100Followers] = useState('');
  const [minBonus, setMinBonus] = useState('');
  const [maxBonus, setMaxBonus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleCreate = async () => {
    if (typeof window.ethereum === 'undefined') {
      console.log("MetaMask is not installed!");
      return;
    }

    setIsLoading(true);
   
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

      const [address] = await walletClient.requestAddresses();

      const { request } = await publicClient.simulateContract({
        account: address,
        address: contractAddress,
        abi: contractABI,
        functionName: 'createFarcasterToken',
        args: [
          name,
          symbol,
          parseEther(basePrice),
          parseEther(priceIncreasePerToken),
          parseEther(priceIncreasePer100Followers),
          parseEther(minBonus),
          parseEther(maxBonus),
          "https://pbs.twimg.com/media/F4PQm7tXMAEQW3N?format=jpg&name=medium"
        ],
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash);

      console.log('Transaction hash:', hash);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction receipt:', receipt);

      // Reset form
      setName('');
      setSymbol('');
      setBasePrice('');
      setPriceIncreasePerToken('');
      setPriceIncreasePer100Followers('');
      setMinBonus('');
      setMaxBonus('');
    } catch (error) {
      console.error('Error creating token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <motion.h1
        className="text-3xl font-extrabold mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Create Social Token
      </motion.h1>
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[
          { label: "Token Name", value: name, setter: setName },
          { label: "Token Symbol", value: symbol, setter: setSymbol },
          { label: "Base Price (in ETH)", value: basePrice, setter: setBasePrice },
          { label: "Price Increase per Token (in ETH)", value: priceIncreasePerToken, setter: setPriceIncreasePerToken },
          { label: "Price Increase per 100 Followers (in ETH)", value: priceIncreasePer100Followers, setter: setPriceIncreasePer100Followers },
          { label: "Min Bonus (%)", value: minBonus, setter: setMinBonus },
          { label: "Max Bonus (%)", value: maxBonus, setter: setMaxBonus },
        ].map(({ label, value, setter }, index) => (
          <motion.div
            key={index}
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <label className="block text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={label}
              className="border p-2 w-full rounded"
            />
          </motion.div>
        ))}
        <motion.button
          onClick={handleCreate}
          disabled={isLoading}
          className={`w-full py-2 text-white font-semibold rounded ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? 'Creating...' : 'Create Token'}
        </motion.button>
        {txHash && (
          <motion.p
            className="mt-4 text-green-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transaction submitted: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash}</a>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default CreateToken;
