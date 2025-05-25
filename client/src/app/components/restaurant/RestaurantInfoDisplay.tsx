'use client';

import React from 'react';
import { Typography, Avatar, Tooltip, Spin } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useRestaurantInfo } from '@/app/hooks/useRestaurantInfo';
import ImageWithFallback from '@/app/components/common/ImageWithFallback';

const { Text } = Typography;

interface RestaurantInfoDisplayProps {
  showName?: boolean;
  showLogo?: boolean;
  showPhone?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

const RestaurantInfoDisplay: React.FC<RestaurantInfoDisplayProps> = ({
  showName = true,
  showLogo = true,
  showPhone = false,
  size = 'default',
  className = ''
}) => {
  // Use the shared hook instead of duplicating fetch logic
  const { restaurant, loading } = useRestaurantInfo();

  if (loading && !restaurant) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Spin size="small" />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  const avatarSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  const logoSize = avatarSize;
  const textSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLogo && (
        <Tooltip title={restaurant.name}>
          <div className="relative" style={{ width: logoSize, height: logoSize }}>
            <ImageWithFallback
              src={restaurant.logo_url || ''}
              alt={restaurant.name || "Restaurant logo"}
              width={logoSize}
              height={logoSize}
              className="rounded-full"
              fallbackSrc="/default-avatar.png"
            />
          </div>
        </Tooltip>
      )}
      
      <div className="flex flex-col">
        {showName && (
          <Text 
            strong 
            className={`text-${textSize} text-gray-800`}
            style={{ lineHeight: 1.2 }}
          >
            {restaurant.name}
          </Text>
        )}
        
        {showPhone && restaurant.phone && (
          <Text 
            type="secondary" 
            className={`text-${size === 'small' ? 'xs' : 'sm'}`}
            style={{ lineHeight: 1.2 }}
          >
            {restaurant.phone}
          </Text>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfoDisplay;
