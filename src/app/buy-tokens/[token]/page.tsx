"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import BuyToken from '../../Components/Buy-Token'; // Adjust the import path as necessary

const TokenPage: React.FC = () => {
  const params = useParams<{ token: string }>()
  console.log(params) // Get the token from the URL

  // Ensure token is a string or null
  // const tokenString = Array.isArray(token) ? token[0] : token || null;

  return (
    <div>
      
      <BuyToken token={params.token} /> {/* Pass the token to BuyToken */}
    </div>
  );
};

export default TokenPage;
