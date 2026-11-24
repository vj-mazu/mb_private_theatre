import NextImage, { type ImageProps } from 'next/image';

/** next/image with a sharp default quality (85, WebP). Sizes stay responsive. */
export default function Img({ quality = 85, ...props }: ImageProps) {
  return <NextImage quality={quality} {...props} />;
}
