export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-4">
      <h1 className="text-xl font-semibold text-gray-800">Loading</h1>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#0f4c35] animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-4 h-4 rounded-full bg-[#0f4c35] animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-4 h-4 rounded-full bg-[#0f4c35] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}