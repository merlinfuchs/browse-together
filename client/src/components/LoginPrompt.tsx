import { startAuth } from "../common/auth";

export default function () {
  return (
    <div className="flex items-center justify-center h-full">
      <button onClick={startAuth} className="bg-blue-500 px-4 py-2 rounded-md">
        Start Browsing
      </button>
    </div>
  );
}
