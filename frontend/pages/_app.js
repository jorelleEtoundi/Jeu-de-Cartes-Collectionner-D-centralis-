import { useEffect, useState } from 'react';
import '../styles/globals.css';
import '../styles/modern.css';
import NetworkStatus from '../components/NetworkStatus';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <NetworkStatus />
    </>
  );
}

export default MyApp;
