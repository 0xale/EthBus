'use client'
import homeStyle from "./Styles/HomePage.module.css";
import Image from 'next/image';
import miro from '../public/images/miro.jpg'; // Adjust the path as necessary
import lottieFile from "../../public/bus-animation.json"
import Lottie from "react-lottie"

export default function Home() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottieFile,

  };
  return (
    <div className={homeStyle.container}>
      <Lottie
        options={defaultOptions}
        height={50}
        width={100}
      />
      <div className={homeStyle.image}>
        <img src={`${process.env.NEXT_PUBLIC_URL}/miro.png`} alt="ETH Bus" width={700} height={475} />
        <p className={homeStyle.imageContent}>
          Our platform enables you to <strong className="text-indigo-600">bridge tokens from Layer 2 to Layer 1</strong> efficiently using <strong className="text-indigo-600">CCIP</strong>, which significantly reduces gas fees. Instead of paying the full cost of a traditional bridge, you’ll only need to cover <strong className="text-indigo-600">1/10th of the price</strong>. By utilizing our <strong className="text-indigo-600">ETH bus mechanism</strong>, you can benefit from substantial <strong className="text-indigo-600">gas savings</strong>, making cross-chain transfers more affordable and accessible.
        </p>
      </div>
    </div>
  );
}
