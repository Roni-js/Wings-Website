// @ts-nocheck
import React from 'react';
import companyLogo from '../logo.jpg';

interface WingsLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const WingsLogo: React.FC<WingsLogoProps> = ({
  className = '',
  showText = true,
  size = 'lg',
  iconOnly = false,
  layout = 'horizontal'
}) => {
  const iconDimensions: Record<NonNullable<WingsLogoProps['size']>, string> = {
    sm: 'w-7 h-7',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const titleSizes: Record<NonNullable<WingsLogoProps['size']>, string> = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-6xl'
  };

  const subSizes: Record<NonNullable<WingsLogoProps['size']>, string> = {
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  };

  const containerLayout = layout === 'vertical'
    ? 'flex-col text-center items-center gap-2'
    : 'items-center gap-3';

  return (
    <div className={`inline-flex ${containerLayout} ${className}`}>
      {/* WINGS Company Logo (.jpg file from src/logo.jpg) */}
      <div className={`${iconDimensions[size]} relative flex items-center justify-center shrink-0 overflow-visible bg-transparent group-hover:scale-[1.02] transition-all`}>
        <img
          src={companyLogo}
          alt="WINGS Marketing Logo"
          className="w-full h-full object-contain object-center transition-transform duration-300"
        />
      </div>

      {/* WINGS Wordmark */}
      {showText && !iconOnly && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center text-center' : 'text-left'}`}>
          <span className={`font-display font-black tracking-[0.12em] text-white ${titleSizes[size]} uppercase leading-none`}>
            WINGS
          </span>
          <span className={`${subSizes[size]} tracking-[0.3em] text-[#AAB2C8] font-bold uppercase mt-1.5 leading-none`}>
            Marketing
          </span>
        </div>
      )}
    </div>
  );
};

