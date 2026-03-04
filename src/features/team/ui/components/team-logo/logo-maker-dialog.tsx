'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Button } from '@/shared/ui/shadcn/button';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { cn } from '@/shared/lib/utils';
import {
  createTeamAutoLogoFile,
  getTeamAutoLogoIconSrc,
  getTeamAutoLogoSimpleIconEmoji,
  TEAM_AUTO_LOGO_BG_COLOR_GROUPS,
  TEAM_AUTO_LOGO_BG_COLORS,
  type TeamAutoLogoAnimalIconId,
  type TeamAutoLogoIconId,
  type TeamAutoLogoSimpleIconId,
} from '@/features/team/lib';

interface TeamLogoMakerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUploadingLogo: boolean;
  onLogoFileSelect: (file: File) => Promise<void>;
}

const SIMPLE_AUTO_LOGO_ICONS: { id: TeamAutoLogoSimpleIconId; label: string }[] = [
  { id: 'emoji_lion', label: '사자 심볼' },
  { id: 'emoji_bolt', label: '번개 심볼' },
  { id: 'emoji_alien', label: '외계인 심볼' },
  { id: 'emoji_globe', label: '지구 심볼' },
  { id: 'emoji_chicken', label: '닭 심볼' },
  { id: 'emoji_poop', label: '똥 심볼' },
  { id: 'emoji_unicorn', label: '유니콘 심볼' },
  { id: 'emoji_fire', label: '불꽃 심볼' },
  { id: 'emoji_gem', label: '보석 심볼' },
  { id: 'emoji_basketball', label: '농구공 심볼' },
  { id: 'emoji_target', label: '과녁 심볼' },
  { id: 'emoji_crown', label: '왕관 심볼' },
];

const ANIMAL_AUTO_LOGO_ICONS: { id: TeamAutoLogoAnimalIconId; label: string }[] = [
  { id: 'cobra', label: '코브라' },
  { id: 'lion', label: '사자' },
  { id: 'leopard', label: '표범' },
  { id: 'rhino', label: '코뿔소' },
  { id: 'wolf', label: '늑대' },
  { id: 'eagle', label: '독수리' },
];

type LogoSymbolTab = 'icon' | 'animal';

export function TeamLogoMakerDialog({
  open,
  onOpenChange,
  isUploadingLogo,
  onLogoFileSelect,
}: TeamLogoMakerDialogProps) {
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string>('');
  const [isRandomDefaultInitialized, setIsRandomDefaultInitialized] = useState(false);
  const [colorPageIndex, setColorPageIndex] = useState(0);
  const [selectedBgColor, setSelectedBgColor] = useState<string>(TEAM_AUTO_LOGO_BG_COLORS[0]);
  const [symbolTab, setSymbolTab] = useState<LogoSymbolTab>('icon');
  const [selectedSimpleIconId, setSelectedSimpleIconId] = useState<TeamAutoLogoSimpleIconId>('emoji_lion');
  const [selectedAnimalIconId, setSelectedAnimalIconId] = useState<TeamAutoLogoAnimalIconId>('cobra');

  const selectedIconId: TeamAutoLogoIconId = symbolTab === 'icon'
    ? selectedSimpleIconId
    : selectedAnimalIconId;
  const totalColorPages = TEAM_AUTO_LOGO_BG_COLOR_GROUPS.length;

  useEffect(() => {
    if (!open || isRandomDefaultInitialized) return;

    const randomColor = TEAM_AUTO_LOGO_BG_COLORS[
      Math.floor(Math.random() * TEAM_AUTO_LOGO_BG_COLORS.length)
    ];
    const randomSimpleIconId = SIMPLE_AUTO_LOGO_ICONS[
      Math.floor(Math.random() * SIMPLE_AUTO_LOGO_ICONS.length)
    ]?.id;
    const randomColorPageIndex = TEAM_AUTO_LOGO_BG_COLOR_GROUPS.findIndex((group) =>
      group.some((color) => color === randomColor)
    );

    setSymbolTab('icon');
    setSelectedBgColor(randomColor);
    if (randomSimpleIconId) {
      setSelectedSimpleIconId(randomSimpleIconId);
    }
    if (randomColorPageIndex >= 0) {
      setColorPageIndex(randomColorPageIndex);
    }
    setIsRandomDefaultInitialized(true);
  }, [open, isRandomDefaultInitialized]);

  useEffect(() => {
    if (!open) return;

    let isDisposed = false;
    let nextUrl = '';

    const generatePreview = async () => {
      try {
        const previewFile = await createTeamAutoLogoFile({
          iconId: selectedIconId,
          backgroundColor: selectedBgColor,
        });
        nextUrl = URL.createObjectURL(previewFile);

        if (isDisposed) {
          URL.revokeObjectURL(nextUrl);
          return;
        }

        setPreviewLogoUrl((previous) => {
          if (previous.startsWith('blob:')) {
            URL.revokeObjectURL(previous);
          }
          return nextUrl;
        });
      } catch {
        if (nextUrl) {
          URL.revokeObjectURL(nextUrl);
        }
      }
    };

    void generatePreview();

    return () => {
      isDisposed = true;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [open, selectedIconId, selectedBgColor]);

  useEffect(() => {
    if (open) return;

    setPreviewLogoUrl((previous) => {
      if (previous.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return '';
    });
  }, [open]);

  const handleAutoLogoCreate = async () => {
    setIsGeneratingLogo(true);
    try {
      const file = await createTeamAutoLogoFile({
        iconId: selectedIconId,
        backgroundColor: selectedBgColor,
      });
      await onLogoFileSelect(file);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '로고 생성에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xxl">
        <DialogHeader>
          <DialogTitle>로고 만들기</DialogTitle>
          <DialogDescription>
            아이콘과 배경색을 선택해 팀 로고를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex justify-center">
            {previewLogoUrl ? (
              <Image
                src={previewLogoUrl}
                alt="생성될 팀 로고 미리보기"
                width={112}
                height={112}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-28 w-28 animate-pulse rounded-full bg-slate-200"
                aria-hidden
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">배경색</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="이전 색상 그룹"
                  disabled={colorPageIndex === 0}
                  onClick={() => setColorPageIndex((prev) => Math.max(prev - 1, 0))}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200',
                    colorPageIndex === 0
                      ? 'cursor-not-allowed text-slate-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="다음 색상 그룹"
                  disabled={colorPageIndex === totalColorPages - 1}
                  onClick={() => setColorPageIndex((prev) => Math.min(prev + 1, totalColorPages - 1))}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200',
                    colorPageIndex === totalColorPages - 1
                      ? 'cursor-not-allowed text-slate-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${colorPageIndex * 100}%)` }}
              >
                {TEAM_AUTO_LOGO_BG_COLOR_GROUPS.map((group, groupIndex) => (
                  <div key={`bg-color-group-${groupIndex}`} className="w-full shrink-0">
                    <div className="grid grid-cols-4 gap-2">
                      {group.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedBgColor(color)}
                          className={cn(
                            'h-10 w-full rounded-full border-2 transition',
                            selectedBgColor === color ? 'border-slate-900' : 'border-transparent'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`배경색 ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {TEAM_AUTO_LOGO_BG_COLOR_GROUPS.map((_, index) => (
                <button
                  key={`color-page-${index}`}
                  type="button"
                  onClick={() => setColorPageIndex(index)}
                  aria-label={`색상 그룹 ${index + 1}`}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition',
                    colorPageIndex === index ? 'bg-primary' : 'bg-slate-300'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between border-b border-slate-200">
              <p className="pb-2 text-sm font-semibold text-slate-800">심볼</p>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setSymbolTab('icon')}
                  className={cn(
                    'pb-2 text-sm font-medium transition-colors border-b-2',
                    symbolTab === 'icon'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  아이콘
                </button>
                <button
                  type="button"
                  onClick={() => setSymbolTab('animal')}
                  className={cn(
                    'pb-2 text-sm font-medium transition-colors border-b-2',
                    symbolTab === 'animal'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  동물
                </button>
              </div>
            </div>

            {symbolTab === 'icon' ? (
              <div className="grid grid-cols-6 gap-2 pt-1">
                {SIMPLE_AUTO_LOGO_ICONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedSimpleIconId(id)}
                    aria-label={label}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition',
                      selectedSimpleIconId === id
                        ? 'border-primary bg-brand-weak'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <span className="text-2xl leading-none">{getTeamAutoLogoSimpleIconEmoji(id)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {ANIMAL_AUTO_LOGO_ICONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedAnimalIconId(id)}
                    className={cn(
                      'flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium',
                      selectedAnimalIconId === id
                        ? 'border-primary bg-brand-weak text-primary'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    <Image
                      src={getTeamAutoLogoIconSrc(id)}
                      alt={`${label} 아이콘`}
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] object-contain"
                    />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            className="h-11 w-full"
            disabled={isUploadingLogo || isGeneratingLogo}
            onClick={handleAutoLogoCreate}
          >
            {isGeneratingLogo ? (
              <>
                <Spinner className="mr-2 h-4 w-4 text-white" />
                생성 중...
              </>
            ) : (
              '이 로고 사용하기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
