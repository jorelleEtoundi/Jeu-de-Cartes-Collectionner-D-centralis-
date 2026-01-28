import { useEffect, useState } from 'react';
import '../styles/globals.css';
import '../styles/modern.css';
import NetworkStatus from '../components/NetworkStatus';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Empêcher le rendu jusqu'à ce que le client soit montage
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Component {...pageProps} />
      <NetworkStatus />
    </>
  );
}

export default MyApp;
