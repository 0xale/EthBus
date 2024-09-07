import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  return (
    <motion.nav
      className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex space-x-4">
        <motion.div
          className="text-xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/" className="hover:text-blue-400">ST</Link>
        </motion.div>
        <motion.div
          className="flex space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/all-tokens" className="hover:text-blue-400">Buy Tokens</Link>
          <Link href="/create-tokens" className="hover:text-blue-400">Launch Token</Link>
          <Link href="/user-tokens" className="hover:text-blue-400">View Your Tokens</Link>
        </motion.div>
      </div>

      <div className="flex items-center space-x-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ConnectButton />
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
