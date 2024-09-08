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
import Image from 'next/image';
import bus from "../../../public/bus.png"
import seattaken from "../../../public/seat-taken.svg"
import seatempty from "../../../public/seat-empty.svg"
import { truncateAddress } from '../utils/truncateAddress';


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
        args: [destinationChainSelector, receiver, token]
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
      <div className='border border-gray-700  rounded-xl'>
        <h1 className="text-2xl font-bold text-center my-3 text-gray-700">Tickets for</h1>
        <h1 className="text-3xl font-bold text-center my-3 mb-6">USDC to Ethereum</h1>

        <div className="mb-6 flex justify-center">
          <button
            className="button-19 max-w-max p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
            onClick={getFees}
          >
            Wanna Check Ticket Price ?
          </button>
        </div>

        {estimatedFees !== null && (
          <div className="mb-6 text-center">
            <p className="text-md font-normal">Ticket Price: </p>
            <span className="text-xl font-bold">~{formatUnits(estimatedFees, 18)} ETH</span>
          </div>
        )}

        <div className="mb-4 flex flex-col items-center">
          <input
            type="text"
            value={passengerAmount}
            onChange={(e) => setPassengerAmount(e.target.value)}
            placeholder="Enter Amount"
            // className="input mb-4 p-2 border rounded-md w-60 bg-transparent"
            className=" font-semibold p-2 my-4 bg-dark-gray border border-gray-700 rounded-lg outline-none  focus:ring-1 focus:ring-orange-500"
          />
          <button
            className="button-19 max-w-max p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
            onClick={prepareBus}
            disabled={!estimatedFees || !passengerAmount}
          >
            Join the Bus
          </button>
        </div>
      </div>

      <div className='bg-black rounded-xl my-4 border border-gray-700 pb-10'>
        <h2 className="text-2xl font-bold my-4 text-center">Passengers Info</h2>
        <div className='relative  flex items-center justify-center'>
          <Image src={bus} className="" alt="bus image" />

          <div className="absolute top-[230px] grid grid-cols-2 gap-4 justify-center max-w-xs mx-auto">
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className={`relative w-20 h-24 flex items-center justify-center text-lg`}
              >
                <Image src={busData.addresses[index] ? seattaken : seatempty} alt='seat is booked icon' />
                {/* Conditional bubble positioning */}
                {/* Conditional bubble positioning */}
                {/* Conditional bubble positioning */}
                {busData.addresses[index] ?
                  <div className={`absolute top-0 z-10 ${index % 2 === 0 ? '-left-60' : '-right-60'} transform -translate-y-10 w-32 p-3 border border-gray-700 rounded-xl bg-dark-gray shadow-md`}>
                    <p className="text-xs font-bold">{truncateAddress(busData.addresses[index])}</p>
                    <p className="text-xs">{busData.amounts[index]} <span className='text-gray-700'>USDC</span></p>

                    {busData.addresses[index].toLowerCase() === address?.toLowerCase() && (
                      <p className="text-xs text-gray-500 mt-1">Hi! you are here</p>
                    )}
                  </div> : null
                }

                {/* Dashed lines */}
                {busData.addresses[index] && <svg className={`absolute w-full h-full ${index % 2 === 0 ? '-left-32' : '-right-32'} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
                  {/* Horizontal line */}
                  <line
                    x1={index % 2 === 0 ? "100%" : "0"} /* For left or right */
                    y1="50%"
                    x2={index % 2 === 0 ? "20%" : "80%"} /* Extend more for longer horizontal line */
                    y2="50%"
                    stroke="yellow"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* 45-degree line */}
                  <line
                    x1={index % 2 === 0 ? "20%" : "80%"} /* Start where horizontal line ends */
                    y1="50%"
                    x2={index % 2 === 0 ? "0%" : "100%"} /* Horizontal shift + longer diagonal */
                    y2="20%" /* Move upwards more */
                    stroke="yellow"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* <div className="mb-4">

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
      </div> */}

      {
        busData.addresses.length === 10 && estimatedFees !== null && (
          <div className="mt-4 text-center">
            <button className="button-19 p-2 max-w-max text-white rounded-md shadow-md " onClick={executeBus}>
              Execute Bus
            </button>
          </div>
        )
      }

    </div >
  );

};

export default EthBusApp;
