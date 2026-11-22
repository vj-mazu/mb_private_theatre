import NextImage, { type ImageProps } from 'next/image';

/** next/image with a sharper default quality (85 instead of 75). Sizes stay responsive. */
export default function Img({ quality = 85, ...props }: ImageProps) {
  return <NextImage quality={quality} {...props} />;
}
