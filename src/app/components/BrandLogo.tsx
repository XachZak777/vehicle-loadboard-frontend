import type { ImgHTMLAttributes } from 'react';
import { APP_NAME } from '../constants';
import lightLogo from '../../../logos/logo-h-light.png';
import darkLogo from '../../../logos/logo-h-dark.png';

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export function BrandLogo({ alt = APP_NAME, className = '', ...props }: BrandLogoProps) {
  return (
    <>
      <img src={lightLogo} alt={alt} className={`${className} dark:hidden`} {...props} />
      <img src={darkLogo} alt={alt} className={`${className} hidden dark:block`} {...props} />
    </>
  );
}
