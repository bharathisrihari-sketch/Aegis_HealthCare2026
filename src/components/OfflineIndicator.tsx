import React, { useEffect, useState } from 'react';
import { WifiOff, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPendingSyncCount } from '../engine/offlineStore';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const checkSync = async () => {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    };
    checkSync();
    const interval = setInterval(checkSync, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-amber-500/80 px-3 py-2 text-xs text-amber-200 shadow-2xl font-mono animate-fadeIn">
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <div>
            <div className="font-bold text-amber-300">Offline Mode Active</div>
            <div className="text-[10px] text-amber-200/80">Using IndexedDB local stock cache</div>
          </div>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
          <div>
            <div className="font-bold text-teal-300">Syncing Local Database...</div>
            <div className="text-[10px] text-teal-200/80">{pendingCount} offline reports pending</div>
          </div>
        </>
      )}
    </div>
  );
};
