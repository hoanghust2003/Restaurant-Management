'use client';

import React from 'react';
import { InputNumber } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';

interface NumberInputProps extends InputNumberProps {
  allowDecimals?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  placeholder,
  value,
  onChange,
  min = 0,
  allowDecimals = false,
  ...props 
}) => {
  const formatter = (value: number | string | undefined): string => {
    if (!value) return '';
    let strValue = String(value);
    // Remove non-digit characters except decimal point if decimals are allowed
    strValue = strValue.replace(allowDecimals ? /[^\d.]/g : /[^\d]/g, '');
    // Format with thousands separator
    const parts = strValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const parser = (value: string | undefined): string => {
    if (!value) return '';
    // Remove non-digit characters except decimal point if decimals are allowed
    return value.replace(allowDecimals ? /[^\d.]/g : /[^\d]/g, '');
  };

  return (
    <InputNumber
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      formatter={formatter}
      parser={parser}
      style={{ width: '100%' }}
      {...props}
    />
  );
};

export default NumberInput;
