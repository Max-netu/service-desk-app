import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="animate-spin">
        <Loader2 className="w-12 h-12 text-yellow-400" />
      </div>
      <p className="mt-4 text-gray-200 font-medium">Učitava...</p>
    </div>
  );
}
