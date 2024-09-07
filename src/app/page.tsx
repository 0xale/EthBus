import Image from "next/image";
import homeStyle from "./Styles/HomePage.module.css";

export default function Home() {
  return (
    <div className={homeStyle.container}>
      <h1 className={homeStyle.header}>Social Tokens</h1>
      <div className={homeStyle.image}>
        <p>
          Our platform empowers you to <strong>create social tokens</strong> with ease, using a <strong>bonding curve mechanism</strong> that dynamically adjusts their value. As more tokens are issued and your <strong>Farcaster follower count</strong> grows, the value of each token increases. Plus, we add an exciting twist: <strong>bonus tokens</strong> are minted through the <strong>Pyth Oracal</strong>, generating random percentages from the <strong>ETH/USD price feed</strong>. This innovative system not only <strong>boosts user engagement</strong> but also <strong>enhances token value</strong> through its growth-based pricing model.
        </p>
      </div>
    </div>
  );
}
