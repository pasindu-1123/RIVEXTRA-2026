export default function Loading() {
  return (
    <main className="min-h-screen bg-[#05080f] text-white flex items-center justify-center p-6">
      <div className="premium-card blue-glow w-full max-w-md p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Loading Digital Card...</p>
      </div>
    </main>
  );
}