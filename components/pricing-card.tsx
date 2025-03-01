import React from 'react';
import Link from 'next/link';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  highlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  highlighted = false,
}) => {
  return (
    <div
      className={`flex flex-col rounded-lg border ${
        highlighted
          ? 'border-milab-500 bg-white shadow-lg'
          : 'border-gray-200 bg-white shadow-sm'
      } p-6`}
    >
      {highlighted && (
        <div className="mb-4 rounded-full bg-milab-50 px-3 py-1 text-center text-sm font-medium text-milab-600 self-start">
          おすすめ
        </div>
      )}
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="ml-1 text-gray-500">/{period}</span>}
      </div>
      <p className="mt-2 text-gray-600">{description}</p>
      <ul className="mt-6 mb-6 space-y-2 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="h-5 w-5 text-milab-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`mt-auto inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-milab-400 focus:ring-offset-2 ${
          buttonVariant === 'default'
            ? 'bg-milab-500 text-white hover:bg-milab-600'
            : 'border border-milab-500 text-milab-500 hover:bg-milab-50'
        }`}
      >
        <Link href="/register" className={buttonVariant === 'default' ? 'text-white' : ''}>
          {buttonText}
        </Link>
      </button>
    </div>
  );
};

export default PricingCard; 