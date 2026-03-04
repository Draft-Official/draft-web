export const TEAM_AUTO_LOGO_BG_COLOR_GROUPS = [
  // Cool navy / blue / neutral
  ['#252A3A', '#AEB8C2', '#D8DADF', '#5F6B7A', '#2542B8', '#2A72E8', '#7AB0E3', '#B6D2E8'],
  // Green / yellow / earth
  ['#168055', '#12C987', '#83E39B', '#BDE4AF', '#9B5517', '#F7C900', '#ECDA6C', '#E8DEA4'],
  // Accent set
  ['#A5032A', '#FF4E39', '#E7CBC0', '#DFF039', '#5B30EA', '#53E3B4', '#F97762'],
] as const;

export const TEAM_AUTO_LOGO_BG_COLORS = [
  ...TEAM_AUTO_LOGO_BG_COLOR_GROUPS[0],
  ...TEAM_AUTO_LOGO_BG_COLOR_GROUPS[1],
  ...TEAM_AUTO_LOGO_BG_COLOR_GROUPS[2],
] as const;

export const TEAM_AUTO_LOGO_SIMPLE_ICON_IDS = [
  'emoji_lion',
  'emoji_bolt',
  'emoji_alien',
  'emoji_globe',
  'emoji_chicken',
  'emoji_poop',
  'emoji_unicorn',
  'emoji_fire',
  'emoji_gem',
  'emoji_basketball',
  'emoji_target',
  'emoji_crown',
] as const;

export const TEAM_AUTO_LOGO_ANIMAL_ICON_IDS = [
  'cobra',
  'lion',
  'leopard',
  'rhino',
  'wolf',
  'eagle',
] as const;

export const TEAM_AUTO_LOGO_ICON_IDS = [
  ...TEAM_AUTO_LOGO_SIMPLE_ICON_IDS,
  ...TEAM_AUTO_LOGO_ANIMAL_ICON_IDS,
] as const;

export type TeamAutoLogoSimpleIconId = (typeof TEAM_AUTO_LOGO_SIMPLE_ICON_IDS)[number];
export type TeamAutoLogoAnimalIconId = (typeof TEAM_AUTO_LOGO_ANIMAL_ICON_IDS)[number];
export type TeamAutoLogoIconId = (typeof TEAM_AUTO_LOGO_ICON_IDS)[number];

const TEAM_AUTO_LOGO_SIMPLE_ICON_EMOJI: Record<TeamAutoLogoSimpleIconId, string> = {
  emoji_lion: '🦁',
  emoji_bolt: '⚡',
  emoji_alien: '👽',
  emoji_globe: '🌐',
  emoji_chicken: '🐔',
  emoji_poop: '💩',
  emoji_unicorn: '🦄',
  emoji_fire: '🔥',
  emoji_gem: '💎',
  emoji_basketball: '🏀',
  emoji_target: '🎯',
  emoji_crown: '👑',
};

const TEAM_AUTO_LOGO_ANIMAL_ICON_SRCS: Record<TeamAutoLogoAnimalIconId, string> = {
  cobra: '/logos/auto-icons/cobra.png',
  lion: '/logos/auto-icons/lion.png',
  leopard: '/logos/auto-icons/leopard.png',
  rhino: '/logos/auto-icons/rhino.png',
  wolf: '/logos/auto-icons/wolf.png',
  eagle: '/logos/auto-icons/eagle.png',
};

const TEAM_AUTO_LOGO_CANVAS_SIZE = 512;
const TEAM_AUTO_LOGO_BACKGROUND_RADIUS = TEAM_AUTO_LOGO_CANVAS_SIZE / 2;
const TEAM_AUTO_LOGO_ANIMAL_IMAGE_SIZE = 360;
const TEAM_AUTO_LOGO_EMOJI_FONT_SIZE = 220;
const TEAM_AUTO_LOGO_ANIMAL_ALPHA_THRESHOLD = 10;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function getTeamAutoLogoIconColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#FFFFFF';

  const luminance =
    (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  return luminance > 0.6 ? '#0F172A' : '#FFFFFF';
}

export function getTeamAutoLogoSimpleIconEmoji(iconId: TeamAutoLogoSimpleIconId): string {
  return TEAM_AUTO_LOGO_SIMPLE_ICON_EMOJI[iconId];
}

function isAnimalIconId(iconId: TeamAutoLogoIconId): iconId is TeamAutoLogoAnimalIconId {
  return (TEAM_AUTO_LOGO_ANIMAL_ICON_IDS as readonly string[]).includes(iconId);
}

export function getTeamAutoLogoIconSrc(iconId: TeamAutoLogoAnimalIconId): string {
  return TEAM_AUTO_LOGO_ANIMAL_ICON_SRCS[iconId];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('자동 생성 로고 이미지를 렌더링하지 못했습니다.'));
    image.src = src;
  });
}

function prepareAnimalSymbolCanvas(image: HTMLImageElement) {
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = image.naturalWidth || image.width;
  sourceCanvas.height = image.naturalHeight || image.height;

  const sourceContext = sourceCanvas.getContext('2d');
  if (!sourceContext) {
    throw new Error('동물 심볼 처리에 실패했습니다.');
  }

  sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
  const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const { data } = imageData;

  let minX = sourceCanvas.width;
  let minY = sourceCanvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceCanvas.height; y += 1) {
    for (let x = 0; x < sourceCanvas.width; x += 1) {
      const index = (y * sourceCanvas.width + x) * 4;
      const alpha = data[index + 3];

      if (alpha < TEAM_AUTO_LOGO_ANIMAL_ALPHA_THRESHOLD) {
        data[index + 3] = 0;
        continue;
      }

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  sourceContext.putImageData(imageData, 0, 0);

  if (maxX < minX || maxY < minY) {
    return {
      canvas: sourceCanvas,
      sx: 0,
      sy: 0,
      sw: sourceCanvas.width,
      sh: sourceCanvas.height,
    };
  }

  return {
    canvas: sourceCanvas,
    sx: minX,
    sy: minY,
    sw: maxX - minX + 1,
    sh: maxY - minY + 1,
  };
}

export async function createTeamAutoLogoFile({
  iconId,
  backgroundColor,
}: {
  iconId: TeamAutoLogoIconId;
  backgroundColor: string;
}): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = TEAM_AUTO_LOGO_CANVAS_SIZE;
  canvas.height = TEAM_AUTO_LOGO_CANVAS_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('자동 생성 로고 렌더링에 실패했습니다.');
  }

  if (isAnimalIconId(iconId)) {
    const image = await loadImage(getTeamAutoLogoIconSrc(iconId));
    const prepared = prepareAnimalSymbolCanvas(image);
    const iconColor = getTeamAutoLogoIconColor(backgroundColor);

    context.clearRect(0, 0, TEAM_AUTO_LOGO_CANVAS_SIZE, TEAM_AUTO_LOGO_CANVAS_SIZE);
    context.beginPath();
    context.arc(
      TEAM_AUTO_LOGO_CANVAS_SIZE / 2,
      TEAM_AUTO_LOGO_CANVAS_SIZE / 2,
      TEAM_AUTO_LOGO_BACKGROUND_RADIUS,
      0,
      Math.PI * 2
    );
    context.fillStyle = backgroundColor;
    context.fill();

    const iconX = (TEAM_AUTO_LOGO_CANVAS_SIZE - TEAM_AUTO_LOGO_ANIMAL_IMAGE_SIZE) / 2;
    const iconY = (TEAM_AUTO_LOGO_CANVAS_SIZE - TEAM_AUTO_LOGO_ANIMAL_IMAGE_SIZE) / 2;

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    // Dark 배경에서는 흰색 계열로 반전하여 문양 가시성을 확보한다.
    context.filter = iconColor === '#FFFFFF' ? 'invert(1)' : 'none';
    context.drawImage(
      prepared.canvas,
      prepared.sx,
      prepared.sy,
      prepared.sw,
      prepared.sh,
      iconX,
      iconY,
      TEAM_AUTO_LOGO_ANIMAL_IMAGE_SIZE,
      TEAM_AUTO_LOGO_ANIMAL_IMAGE_SIZE
    );
    context.restore();
  } else {
    const emoji = getTeamAutoLogoSimpleIconEmoji(iconId);

    context.clearRect(0, 0, TEAM_AUTO_LOGO_CANVAS_SIZE, TEAM_AUTO_LOGO_CANVAS_SIZE);
    context.beginPath();
    context.arc(
      TEAM_AUTO_LOGO_CANVAS_SIZE / 2,
      TEAM_AUTO_LOGO_CANVAS_SIZE / 2,
      TEAM_AUTO_LOGO_BACKGROUND_RADIUS,
      0,
      Math.PI * 2
    );
    context.fillStyle = backgroundColor;
    context.fill();

    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `${TEAM_AUTO_LOGO_EMOJI_FONT_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    context.fillText(emoji, TEAM_AUTO_LOGO_CANVAS_SIZE / 2, TEAM_AUTO_LOGO_CANVAS_SIZE / 2 + 6);
    context.restore();
  }

  const pngBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!pngBlob) {
    throw new Error('자동 생성 로고를 PNG로 변환하지 못했습니다.');
  }

  return new File([pngBlob], `auto-logo-${iconId}-${Date.now()}.png`, {
    type: 'image/png',
  });
}
