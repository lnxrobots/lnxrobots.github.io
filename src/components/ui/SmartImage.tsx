'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';

async function getValidSrc(primary: string, fallback: string) {
  try {
    const res = await fetch(primary, { method: 'HEAD' });
    return res.ok ? primary : fallback;
  } catch {
    return fallback;
  }
}

interface SmartImageProps {
  primaryUrl: string;
  fallbackUrl: string;
  alt: string;
  className: string;
}

export default function SmartImage({ primaryUrl, fallbackUrl, alt, className }: SmartImageProps) {
  const [activeSrc, setActiveSrc] = useState('');

  useEffect(() => {
    getValidSrc(primaryUrl, fallbackUrl).then((validUrl) => {
      setActiveSrc(validUrl);
    });
  }, [primaryUrl, fallbackUrl]);

  if (!activeSrc) return <div className="bg-board w-full h-full" />;

  return (
    <Image
      src={activeSrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
    />
  );
}
