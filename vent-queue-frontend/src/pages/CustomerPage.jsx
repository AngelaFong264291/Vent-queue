import { useState } from "react";
import { useParams } from "react-router-dom";
import { joinQueue } from "../api/queue";

export default function CustomerPage() {
  const { shopId } = useParams();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [joined, setJoined] = useState(false);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    // Basic validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (phone.length !== 8) {
      setError("Please enter a valid 8-digit HK phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await joinQueue(shopId, name, phone, partySize);
      if (data.error) {
        setError(data.error);
      } else {
        setQueueInfo(data);
        setJoined(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // After joining — show confirmation
  if (joined && queueInfo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm text-center border border-gray-800">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-white text-2xl font-semibold mb-2">
            You're in the queue!
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            We'll SMS you when your table is ready
          </p>

          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <p className="text-gray-400 text-sm mb-1">Your position</p>
            <p className="text-white text-4xl font-bold">
              #{queueInfo.position}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Estimated wait</p>
            <p className="text-white text-2xl font-bold">
              ~{queueInfo.estimated_wait} min
            </p>
          </div>

          <p className="text-gray-500 text-xs">
            You can close this page — we'll SMS you 📱
          </p>
        </div>
      </div>
    );
  }

  // Join queue form
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm border border-gray-800">
        <div className="text-4xl mb-4">🍽️</div>
        <h1 className="text-white text-2xl font-semibold mb-1">
          Join the queue
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          We'll SMS you when your table is ready
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 小明"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none border border-gray-700 focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Phone number
            </label>
            <div className="flex gap-2">
              <span className="bg-gray-800 text-gray-400 rounded-xl px-3 py-3 border border-gray-700">
                +852
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="9123 4567"
                className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none border border-gray-700 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Party size */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Party size
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setPartySize(n)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    partySize === n
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-purple-600 text-white font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed mt-2 transition-all"
          >
            {loading ? "Joining..." : "Join queue →"}
          </button>
        </div>
      </div>
    </div>
  );
}