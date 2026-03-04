const TEAM_LOGO_CROP_OUTPUT_SIZE = 512;
const TEAM_LOGO_CROP_OUTPUT_QUALITY = 0.9;

interface CropBounds {
  maxOffsetX: number;
  maxOffsetY: number;
}

interface SourceCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getCropBounds({
  imageWidth,
  imageHeight,
  cropSize,
  zoom,
}: {
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  zoom: number;
}): CropBounds {
  const coverScale = Math.max(cropSize / imageWidth, cropSize / imageHeight);
  const renderedWidth = imageWidth * coverScale * zoom;
  const renderedHeight = imageHeight * coverScale * zoom;

  return {
    maxOffsetX: Math.max((renderedWidth - cropSize) / 2, 0),
    maxOffsetY: Math.max((renderedHeight - cropSize) / 2, 0),
  };
}

export function getSourceCropRect({
  imageWidth,
  imageHeight,
  cropSize,
  zoom,
  offsetX,
  offsetY,
}: {
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}): SourceCropRect {
  const coverScale = Math.max(cropSize / imageWidth, cropSize / imageHeight);
  const renderedWidth = imageWidth * coverScale * zoom;
  const renderedHeight = imageHeight * coverScale * zoom;

  const topLeftX = (cropSize - renderedWidth) / 2 + offsetX;
  const topLeftY = (cropSize - renderedHeight) / 2 + offsetY;

  const sx = clamp((-topLeftX * imageWidth) / renderedWidth, 0, imageWidth);
  const sy = clamp((-topLeftY * imageHeight) / renderedHeight, 0, imageHeight);
  const sw = clamp((cropSize * imageWidth) / renderedWidth, 1, imageWidth - sx);
  const sh = clamp((cropSize * imageHeight) / renderedHeight, 1, imageHeight - sy);

  return { sx, sy, sw, sh };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    image.src = src;
  });
}

export async function createCroppedTeamLogoFile({
  imageSrc,
  originalName,
  cropSize,
  zoom,
  offsetX,
  offsetY,
}: {
  imageSrc: string;
  originalName: string;
  cropSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}): Promise<File> {
  const image = await loadImage(imageSrc);
  const { sx, sy, sw, sh } = getSourceCropRect({
    imageWidth: image.width,
    imageHeight: image.height,
    cropSize,
    zoom,
    offsetX,
    offsetY,
  });

  const canvas = document.createElement('canvas');
  canvas.width = TEAM_LOGO_CROP_OUTPUT_SIZE;
  canvas.height = TEAM_LOGO_CROP_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('이미지 편집에 실패했습니다. 브라우저를 확인해주세요.');
  }

  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    TEAM_LOGO_CROP_OUTPUT_SIZE,
    TEAM_LOGO_CROP_OUTPUT_SIZE
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', TEAM_LOGO_CROP_OUTPUT_QUALITY);
  });

  if (!blob) {
    throw new Error('이미지 편집 결과를 생성하지 못했습니다.');
  }

  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return new File([blob], `${baseName}-cropped.webp`, { type: 'image/webp' });
}
