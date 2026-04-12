import React, { useState } from "react";
import Loader from "../Common/Loader";
import { FiX } from "react-icons/fi";

interface CasinoIframeProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

const CasinoIframe: React.FC<CasinoIframeProps> = ({
  url,
  title = "Game",
  onClose,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black z-[9990] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-gray-900">
        <span className="text-brand-text font-semibold text-sm">{title}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-gray-300 hover:text-brand-text transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <Loader size="lg" text="Loading game..." />
          </div>
        )}
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default CasinoIframe;
