import React from 'react';
import * as LucideIcons from 'lucide-react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  // アイコン名からLucideIconコンポーネントを取得
  const IconComponent = (LucideIcons as any)[icon] || null;

  return (
    <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 rounded-full bg-milab-100 p-3">
        <div className="h-8 w-8 text-milab-600">
          {IconComponent ? (
            <IconComponent className="h-8 w-8" />
          ) : (
            // アイコンが見つからない場合は最初の文字を表示
            <div className="flex h-full w-full items-center justify-center font-bold">
              {icon.charAt(0)}
            </div>
          )}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard; 