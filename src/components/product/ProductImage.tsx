import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Empty catalogue images stay empty; never substitute another product's photo. */
export const ProductImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, className, ...props }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return (
    <span role="img" aria-label={`تصویر ${alt || 'محصول'} هنوز ثبت نشده`} className={`${className || ''} flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400`}>
      <ImageOff className="w-7 h-7 shrink-0" aria-hidden="true" />
      <span className="text-[10px] font-normal text-center">تصویر هنوز ثبت نشده</span>
    </span>
  );
  return <img {...props} src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};
