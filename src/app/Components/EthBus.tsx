"use client";
import React, { useEffect, useState } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import EthBusABI from "@/app/Contract/EthBusABI.json";
import { initializeClient } from '../utils/publicClient';
import { motion } from 'framer-motion';
import { ethers, formatUnits, parseUnits } from 'ethers';
import { BigNumberish } from 'ethers';

const contractAddress = '0x9b67666Af7f4ba3E603Cf5bdFa85Ff3358b9C55D';
const tokenAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const USDC_DECIMALS = 6; // Adjust based on actual USDC decimals

const EthBusApp: React.FC = () => {
  const [passengerAmount, setPassengerAmount] = useState<string>('');
  const [busData, setBusData] = useState<{ addresses: string[], amounts: string[] }>({ addresses: [], amounts: [] });
  const [estimatedFees, setEstimatedFees] = useState<bigint | null>(null);
  const { writeContractAsync } = useWriteContract();

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: EthBusABI,
    client: client,
  });

  const getCurrentPassengersData = async () => {
    try {
      const passengers = await contract.read.getCurrentBusPassengersData([0]);
      if (Array.isArray(passengers) && passengers.length === 2) {
        const [addresses, amounts] = passengers;
        // Ensure amounts is an array of BigNumbers
        setBusData({
          addresses,
          amounts: amounts.map((amount: BigNumberish) => formatUnits(amount, USDC_DECIMALS))
        });
      }
    } catch (error) {
      console.error('Error fetching current passengers:', error);
    }
  };

  const sendTokens = async (amount: string) => {
    try {
      // Convert the amount to BigNumber with the correct decimal places
      const amountInUnits = parseUnits(amount, USDC_DECIMALS);
  
      const txSendTokens = await writeContractAsync({
        address: tokenAddress as Address,
        account: address,
        abi: [
          {
            "name": "transfer",
            "type": "function",
            "inputs": [
              { "name": "to", "type": "address" },
              { "name": "amount", "type": "uint256" }
            ],
            "outputs": [{ "name": "", "type": "bool" }],
            "stateMutability": "nonpayable"
          }
        ],
        functionName: "transfer",
        args: [contractAddress, amountInUnits],
      });
  
      console.log('Tokens sent successfully:', txSendTokens);
    } catch (error) {
      console.error('Error sending tokens:', error);
    }
  };
  const prepareBus = async () => {
    if (!estimatedFees) {
      console.error('Estimated fees not available');
      return;
    }

    try {
      await sendTokens(passengerAmount); // Send tokens before preparing the bus
      const txPrepareBus = await writeContractAsync({
        address: contractAddress as Address,
        account: address,
        abi: EthBusABI,
        functionName: "prepareBus",
        args: [parseFloat(passengerAmount) * (10 ** USDC_DECIMALS)], // Convert amount to units
        value: estimatedFees, // Include the ETH value
      });
      
      console.log('Bus prepared successfully:', txPrepareBus);
      getCurrentPassengersData();
    } catch (error) {
      console.error('Error preparing bus:', error);
    }
  };

  const getFees = async () => {
    const passengerData = {
      userAddresses: [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012',
        '0x4567890123456789012345678901234567890123',
        '0x5678901234567890123456789012345678901234',
        '0x6789012345678901234567890123456789012345',
        '0x7890123456789012345678901234567890123456',
        '0x8901234567890123456789012345678901234567',
        '0x9012345678901234567890123456789012345678',
        '0x0123456789012345678901234567890123456789',
      ],
      amounts: [
        BigInt('1000000000000000000'),
        BigInt('1500000000000000000'),
        BigInt('2000000000000000000'),
        BigInt('2500000000000000000'),
        BigInt('3000000000000000000'),
        BigInt('3500000000000000000'),
        BigInt('4000000000000000000'),
        BigInt('4500000000000000000'),
        BigInt('5000000000000000000'),
        BigInt('5500000000000000000'),
      ],
    };

    try {
      const destinationChainSelector = "16015286601757825753"; 
      const receiver = '0x15B89822220A2bb9b1F248fAB176E7952d1Be071'; // Receiver address
      const token = tokenAddress;
      const getEstimatedFees = await contract.read.getEstimatedFees([destinationChainSelector, receiver, token,  
        passengerData]);
      if (typeof getEstimatedFees === 'bigint') {
        setEstimatedFees(getEstimatedFees);
      } else {
        throw new Error('Unexpected result type');
      }
      console.log('Estimated fees:', getEstimatedFees);
    } catch (error) {
      console.error('Error getting fees:', error);
    }
  };

  const executeBus = async () => {
    try {
      const destinationChainSelector = "16015286601757825753"; 
      const receiver = '0x15B89822220A2bb9b1F248fAB176E7952d1Be071'; // Receiver address
      const token = tokenAddress;
    

      const txExecuteBus = await writeContractAsync({
        address: contractAddress as Address,
        account: address,
        abi: EthBusABI,
        functionName: "sendMessagePayNative",
        args: [destinationChainSelector,receiver , token]
      });
      
      console.log('Bus executed successfully:', txExecuteBus);
      getCurrentPassengersData();
    } catch (error) {
      console.error('Error executing bus:', error);
    }
  };

  useEffect(() => {
    getCurrentPassengersData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center mb-6">Tickets to take USDC to Ethereum</h1>
  
      <div className="mb-6 flex justify-center">
        <button 
          className="btn btn-secondary p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
          onClick={getFees}
        >
          Check Ticket Price
        </button>
      </div>
      
      {estimatedFees !== null && (
        <div className="mb-6 text-center">
          <p className="text-lg font-bold">Estimated Ticket Price: {formatUnits(estimatedFees, 18)} ETH</p>
        </div>
      )}
  
      <div className="mb-4 flex flex-col items-center">
        <input
          type="text"
          value={passengerAmount}
          onChange={(e) => setPassengerAmount(e.target.value)}
          placeholder="Enter Amount"
          className="input mb-4 p-2 border rounded-md w-60"
        />
        <button 
          className="btn btn-primary p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700" 
          onClick={prepareBus}
          disabled={!estimatedFees || !passengerAmount}
        >
          Join the Bus
        </button>
      </div>
  
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 text-center">Passengers in Bus</h2>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 10 }, (_, index) => (
            <motion.div
              key={index}
              className={`p-4 border ${busData.addresses[index] ? 'bg-green-200' : 'bg-gray-200'} text-center`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {busData.addresses[index] ? (
                <>
                  <p>{busData.addresses[index]}</p>
                  <p>{busData.amounts[index]} USDC</p>
                  {busData.addresses[index].toLowerCase() === address?.toLowerCase() && (
                    <p className="text-xs text-gray-500 mt-1">you are here</p>
                  )}
                </>
              ) : (
                <p>Empty</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
  
      {busData.addresses.length === 10 && estimatedFees !== null && (
        <div className="mt-4 text-center">
          <button className="btn btn-success p-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700" onClick={executeBus}>
            Execute Bus
          </button>
        </div>
      )}
    </div>
  );
  
};

export default EthBusApp;
