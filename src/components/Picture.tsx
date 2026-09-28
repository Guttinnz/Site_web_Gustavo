import type { ImageAsset } from '../data/content';

interface PictureProps {
  image: ImageAsset;
  alt: string;
  sizes: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  /** Baixa com prioridade alta (a imagem que é o LCP da página). */
  priority?: boolean;
}

const OPT_DIR = '/images/opt';

// O React 18 não conhece a prop fetchPriority (avisa no console), mas repassa atributos
// HTML em minúsculas — por isso o atributo vai assim.
const HIGH_PRIORITY: Record<string, string> = { fetchpriority: 'high' };

/**
 * <picture> com AVIF → WebP → JPEG em duas larguras (metade e inteira).
 * Os arquivos em /images/opt são gerados por scripts/images.mjs a partir de
 * public/images/<nome>.jpg.
 */
export function Picture({ image, alt, sizes, className, loading = 'lazy', priority = false }: PictureProps) {
  const half = Math.round(image.width / 2);
  const srcSet = (ext: string) =>
    `${OPT_DIR}/${image.name}-${half}.${ext} ${half}w, ${OPT_DIR}/${image.name}-${image.width}.${ext} ${image.width}w`;

  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`${OPT_DIR}/${image.name}-${image.width}.jpg`}
        srcSet={srcSet('jpg')}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        decoding="async"
        className={className}
        {...(priority ? HIGH_PRIORITY : undefined)}
      />
    </picture>
  );
}
