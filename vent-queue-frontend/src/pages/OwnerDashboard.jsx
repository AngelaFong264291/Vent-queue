import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getOwnerQueue, notifyCustomer, seatCustomer, removeCustomer } from "../api/queue";

export default function OwnerDashboard() {
  const { shopId } = useParams();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = async () => {
    try {
      const data = await getOwnerQueue(shopId);
      setQueue(data.queue);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Auto refresh every 10 seconds
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [shopId]);

  const handleNotify = async (entryId) => {
    setActionLoading(entryId);
    try {
      await notifyCustomer(shopId, entryId);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleSeat = async (entryId) => {
    setActionLoading(entryId);
    try {
      await seatCustomer(shopId, entryId);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleRemove = async (entryId) => {
    setActionLoading(entryId);
    try {
      await removeCustomer(shopId, entryId);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading queue...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-2xl font-semibold">Queue</h1>
            <p className="text-gray-400 text-sm mt-1">
              {shopId} · {queue.length} waiting
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl text-sm border border-gray-700"
          >
            Refresh
          </button>
        </div>

        {/* Empty state */}
        {queue.length === 0 && (
          <div className="bg-gray-900 rounded-2xl p-10 text-center border border-gray-800">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-medium">No one waiting</p>
            <p className="text-gray-400 text-sm mt-1">Queue is empty right now</p>
          </div>
        )}

        {/* Queue list */}
        <div className="flex flex-col gap-3">
          {queue.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
            >
              {/* Customer info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{entry.name}</p>
                    <p className="text-gray-400 text-sm">
                      +852 {entry.phone} · {entry.party_size} pax
                    </p>
                  </div>
                </div>
                {/* Status badge */}
                <span className={`text-xs px-3 py-1 rounded-full ${
                  entry.status === "notified"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-gray-800 text-gray-400"
                }`}>
                  {entry.status === "notified" ? "Notified ✓" : "Waiting"}
                </span>
              </div>

              {/* Joined time */}
              <p className="text-gray-600 text-xs mb-4">
                Joined {new Date(entry.joined_at).toLocaleTimeString("en-HK", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
                {entry.notified_at && (
                  <span className="text-yellow-600 ml-2">
                    · Notified {new Date(entry.notified_at).toLocaleTimeString("en-HK", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                )}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleNotify(entry.id)}
                  disabled={actionLoading === entry.id || entry.status === "notified"}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading === entry.id ? "..." : "📱 Notify"}
                </button>
                <button
                  onClick={() => handleSeat(entry.id)}
                  disabled={actionLoading === entry.id}
                  className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium disabled:opacity-40"
                >
                  {actionLoading === entry.id ? "..." : "✅ Seat"}
                </button>
                <button
                  onClick={() => handleRemove(entry.id)}
                  disabled={actionLoading === entry.id}
                  className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-400 text-sm border border-gray-700 disabled:opacity-40"
                >
                  {actionLoading === entry.id ? "..." : "✕ Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Auto refresh note */}
        <p className="text-gray-600 text-xs text-center mt-6">
          Auto refreshes every 10 seconds
        </p>
      </div>
    </div>
  );
}