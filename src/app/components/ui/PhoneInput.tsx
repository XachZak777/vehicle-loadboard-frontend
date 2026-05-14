import { Input } from './input';
import { formatPhone } from '../../utils/phone';
import type { ComponentProps } from 'react';

type InputProps = ComponentProps<typeof Input>;

interface PhoneInputProps extends Omit<InputProps, 'type' | 'maxLength' | 'onChange' | 'placeholder'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder = '(555) 123-4567', ...props }: PhoneInputProps) {
  return (
    <Input
      {...props}
      type="tel"
      value={value}
      maxLength={14}
      placeholder={placeholder}
      onChange={(e) => onChange(formatPhone(e.target.value))}
    />
  );
}
