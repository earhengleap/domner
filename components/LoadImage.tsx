import Image, { ImageProps } from "next/image";
import React from "react";
// import React, { useState } from "react";

interface LoadImageProps extends Omit<ImageProps, 'src' | 'alt' | 'height' | 'width'> {
  src: string;
  alt: string;
  height: number;
  width: number;
}

const LoadImage: React.FC<LoadImageProps> = ({ src, alt, height, width, ...rest }) => {
  // const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // const handleImageLoad = (): void => {
  //   setImageLoaded(true);
  // };

  function toBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function shimmer(width: number, height: number): string {
    return `https://placehold.co/${width}x${height}.svg`;
  }

  return (
    <Image
      // src={imageLoaded ? `https://placehold.co/${width}x${height}.svg` : src}
      src={src}
      alt={alt}
      height={height}
      width={width}
      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(20, 10))}`}
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(20, 10))}`}
      // onLoad={handleImageLoad}
      {...rest}
    />
  );
};

export default LoadImage;