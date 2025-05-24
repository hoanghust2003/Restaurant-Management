import React from 'react';
import { Typography } from 'antd';
import classNames from 'classnames';

const { Text } = Typography;

interface QrCodeImageProps {
  qrCode: string;
  menuUrl: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
  onError?: (error: Error) => void;
  size?: 'small' | 'medium' | 'large';
}

const QrCodeImage: React.FC<QrCodeImageProps> = ({
  qrCode,
  menuUrl,
  alt,
  className,
  onClick,
  onError,
  size = 'medium'
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('QR code image failed to load');
    e.currentTarget.style.display = 'none';
    if (onError) {
      onError(new Error('Failed to load QR code image'));
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (menuUrl) {
      window.open(menuUrl, '_blank');
    }
  };

  const sizeClasses = {
    small: 'max-w-[150px]',
    medium: 'max-w-[250px]',
    large: 'max-w-[350px]'
  };

  return (
    <div className="qr-code-wrapper text-center">
      <img
        src={qrCode}
        alt={alt || 'QR Code'}
        className={classNames(
          'mx-auto border rounded cursor-pointer hover:opacity-80 transition-opacity',
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        onError={handleError}
      />
      <Text className="block mt-2 text-sm text-gray-500">
        (Click vào mã QR để mở URL)
      </Text>
    </div>
  );
};

export default QrCodeImage;
