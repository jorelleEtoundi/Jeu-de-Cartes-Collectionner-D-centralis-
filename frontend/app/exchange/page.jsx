'use client';

import { useEffect, useState } from 'react';
import ExchangeCards from '../../components/ExchangeCards';
import { connectWallet, getUserCardsDetailed } from '../../utils/web3Utils';

export default function ExchangePage() {
  const [account, setAccount] = useState('');
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async (addr = account) => {
    if (!addr) return;
    setLoading(true);
    try {
      const cards = await getUserCardsDetailed(addr);
      setUserCards(cards);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const acc = await connectWallet();
      setAccount(acc);
      await refresh(acc);
    })();
  }, []);

  return (
    <div style={{ padding: 12 }}>
      {loading && <div style={{ marginBottom: 12 }}>Chargement…</div>}
      <ExchangeCards account={account} userCards={userCards} onRefreshMyCards={refresh} />
    </div>
  );
}
