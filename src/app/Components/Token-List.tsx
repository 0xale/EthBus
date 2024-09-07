"use client";
import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import contractABI from '../Contract/FactoryABI.json';
import { motion } from 'framer-motion';

const contractAddress = '0x5338B0Fa96fD3C7e76dafbD6F27Ca1EFb06E14fe';

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);

  const { data: tokenAddresses } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getAllTokens',
  });

  useEffect(() => {
    if (tokenAddresses) {
      setTokens(tokenAddresses as string[]);
    }
    console.log("first");
  }, [tokenAddresses]);

  return (
    <div className="container mx-auto p-6">
      <motion.h1 
        className="text-3xl font-extrabold text-center mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Available Social Tokens
      </motion.h1>
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {tokens.map((token, index) => (
          <motion.li
            key={index}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src="https://images.prismic.io/yellowcard-academy/6a80502b-eff6-4b97-a25f-1e35f5a87528_ERC20.jpeg?auto=compress,format"
              alt={token}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <a 
                href={`/buy-tokens/${token}`} 
                className="text-white font-semibold text-lg text-center px-4 py-2"
              >
                Click to Get it 
              </a>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default TokenList;
