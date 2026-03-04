import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';

export const TEAM_LOGO_BUCKET = 'team-logos';
export const TEAM_LOGO_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const TEAM_LOGO_ACCEPT = TEAM_LOGO_ALLOWED_MIME_TYPES.join(',');
export const TEAM_LOGO_MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
export const TEAM_LOGO_MAX_FILE_SIZE_LABEL = '3MB';

const TEAM_LOGO_MAX_DIMENSION = 1024;
const TEAM_LOGO_OUTPUT_QUALITY = 0.82;

type AllowedTeamLogoMimeType = (typeof TEAM_LOGO_ALLOWED_MIME_TYPES)[number];

function isAllowedTeamLogoMimeType(type: string): type is AllowedTeamLogoMimeType {
  return TEAM_LOGO_ALLOWED_MIME_TYPES.includes(type as AllowedTeamLogoMimeType);
}

function getReadableTeamLogoError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return '로고 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

export function validateTeamLogoFile(file: File): string | null {
  if (!isAllowedTeamLogoMimeType(file.type)) {
    return 'JPG, PNG, WEBP 파일만 업로드할 수 있습니다.';
  }

  if (file.size > TEAM_LOGO_MAX_FILE_SIZE_BYTES) {
    return `파일 크기는 ${TEAM_LOGO_MAX_FILE_SIZE_LABEL} 이하여야 합니다.`;
  }

  return null;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 파일을 읽을 수 없습니다.'));
    };
    image.src = objectUrl;
  });
}

function getResizedDimensions(width: number, height: number) {
  const maxDimension = Math.max(width, height);
  if (maxDimension <= TEAM_LOGO_MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = TEAM_LOGO_MAX_DIMENSION / maxDimension;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function optimizeTeamLogoFile(file: File): Promise<File> {
  const image = await loadImage(file);
  const { width, height } = getResizedDimensions(image.width, image.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('이미지 처리에 실패했습니다. 브라우저를 확인해주세요.');
  }

  context.drawImage(image, 0, 0, width, height);

  const webpBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', TEAM_LOGO_OUTPUT_QUALITY);
  });

  if (webpBlob) {
    return new File([webpBlob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
      type: 'image/webp',
    });
  }

  const jpegBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', TEAM_LOGO_OUTPUT_QUALITY);
  });

  if (!jpegBlob) {
    throw new Error('이미지 압축에 실패했습니다.');
  }

  return new File([jpegBlob], `${file.name.replace(/\.[^/.]+$/, '')}.jpg`, {
    type: 'image/jpeg',
  });
}

function getStorageFileExtension(fileType: string): string {
  if (fileType === 'image/png') return 'png';
  if (fileType === 'image/jpeg') return 'jpg';
  return 'webp';
}

export interface TeamLogoUploadResult {
  path: string;
  publicUrl: string;
}

export async function uploadTeamLogoFile({
  file,
  userId,
}: {
  file: File;
  userId: string;
}): Promise<TeamLogoUploadResult> {
  const validationError = validateTeamLogoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const optimized = await optimizeTeamLogoFile(file);
  if (optimized.size > TEAM_LOGO_MAX_FILE_SIZE_BYTES) {
    throw new Error(`압축 후 파일 크기가 ${TEAM_LOGO_MAX_FILE_SIZE_LABEL}를 초과했습니다.`);
  }

  const supabase = getSupabaseBrowserClient();
  const ext = getStorageFileExtension(optimized.type);
  const path = `teams/${userId}/logo-${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(TEAM_LOGO_BUCKET)
    .upload(path, optimized, {
      cacheControl: '31536000',
      contentType: optimized.type,
      upsert: false,
    });

  if (error) {
    throw new Error(getReadableTeamLogoError(error));
  }

  const { data } = supabase.storage.from(TEAM_LOGO_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('업로드된 로고 URL을 가져오지 못했습니다.');
  }

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
