import React from 'react';

interface OddsButtonProps {
  odds: number;
  label?: string;
  type?: 'back' | 'lay';
  onClick?: () => void;
  className?: string;
}

const OddsButton: React.FC<OddsButtonProps> = ({
  odds,
  label,
  type = 'back',
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`${
        type === 'back' ? 'odds-button' : 'odds-button-lay'
      } ${className}`}
    >
      {label && (
        <div className="text-[10px] text-neutral-gray-600 uppercase">
          {label}
        </div>
      )}
      <div className="font-bold">{odds.toFixed(2)}</div>
    </button>
  );
};

export default OddsButton;
