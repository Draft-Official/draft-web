'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Button } from '@/shared/ui/shadcn/button';
import { Slider } from '@/shared/ui/shadcn/slider';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  clamp,
  createCroppedTeamLogoFile,
  getCropBounds,
} from '@/features/team/lib';

interface TeamLogoCropDialogProps {
  open: boolean;
  sourceFile: File | null;
  isUploadingLogo: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (file: File) => Promise<void>;
}

interface Point {
  x: number;
  y: number;
}

const CROP_PREVIEW_SIZE = 280;
const CROP_MIN_ZOOM = 0.8;
const CROP_MAX_ZOOM = 3;
const CROP_DEFAULT_ZOOM = 0.9;
const CROP_ZOOM_STEP = 0.05;

export function TeamLogoCropDialog({
  open,
  sourceFile,
  isUploadingLogo,
  onOpenChange,
  onComplete,
}: TeamLogoCropDialogProps) {
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [cropSourceUrl, setCropSourceUrl] = useState<string>('');
  const [cropOriginalName, setCropOriginalName] = useState('team-logo');
  const [cropZoom, setCropZoom] = useState(CROP_DEFAULT_ZOOM);
  const [cropOffset, setCropOffset] = useState<Point>({ x: 0, y: 0 });
  const [cropImageNaturalSize, setCropImageNaturalSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [isCroppingLogo, setIsCroppingLogo] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  useEffect(() => {
    if (!sourceFile) {
      setCropSourceUrl('');
      setCropOriginalName('team-logo');
      setCropImageNaturalSize(null);
      setCropOffset({ x: 0, y: 0 });
      setCropZoom(CROP_DEFAULT_ZOOM);
      return;
    }

    const objectUrl = URL.createObjectURL(sourceFile);
    setCropSourceUrl(objectUrl);
    setCropOriginalName(sourceFile.name);
    setCropImageNaturalSize(null);
    setCropOffset({ x: 0, y: 0 });
    setCropZoom(CROP_DEFAULT_ZOOM);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [sourceFile]);

  const cropBounds = useMemo(() => {
    if (!cropImageNaturalSize) {
      return { maxOffsetX: 0, maxOffsetY: 0 };
    }

    return getCropBounds({
      imageWidth: cropImageNaturalSize.width,
      imageHeight: cropImageNaturalSize.height,
      cropSize: CROP_PREVIEW_SIZE,
      zoom: cropZoom,
    });
  }, [cropImageNaturalSize, cropZoom]);

  const previewImageSize = useMemo(() => {
    if (!cropImageNaturalSize) return null;

    const coverScale = Math.max(
      CROP_PREVIEW_SIZE / cropImageNaturalSize.width,
      CROP_PREVIEW_SIZE / cropImageNaturalSize.height
    );

    return {
      width: cropImageNaturalSize.width * coverScale,
      height: cropImageNaturalSize.height * coverScale,
    };
  }, [cropImageNaturalSize]);

  const clampOffset = (offset: Point) => ({
    x: clamp(offset.x, -cropBounds.maxOffsetX, cropBounds.maxOffsetX),
    y: clamp(offset.y, -cropBounds.maxOffsetY, cropBounds.maxOffsetY),
  });

  const applyCropZoom = (nextZoom: number) => {
    const normalizedZoom = clamp(nextZoom, CROP_MIN_ZOOM, CROP_MAX_ZOOM);
    setCropZoom(normalizedZoom);

    if (!cropImageNaturalSize) return;

    const nextBounds = getCropBounds({
      imageWidth: cropImageNaturalSize.width,
      imageHeight: cropImageNaturalSize.height,
      cropSize: CROP_PREVIEW_SIZE,
      zoom: normalizedZoom,
    });

    setCropOffset((current) => ({
      x: clamp(current.x, -nextBounds.maxOffsetX, nextBounds.maxOffsetX),
      y: clamp(current.y, -nextBounds.maxOffsetY, nextBounds.maxOffsetY),
    }));
  };

  const handleCropZoomChange = (values: number[]) => {
    applyCropZoom(values[0] ?? CROP_DEFAULT_ZOOM);
  };

  const handleCropReset = () => {
    setCropOffset({ x: 0, y: 0 });
    setCropZoom(CROP_DEFAULT_ZOOM);
  };

  const handleCropWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    applyCropZoom(cropZoom + direction * CROP_ZOOM_STEP);
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropImageNaturalSize) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropOffset.x,
      originY: cropOffset.y,
    };
    setIsDraggingCrop(true);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const nextOffset = clampOffset({
      x: dragState.originX + (event.clientX - dragState.startX),
      y: dragState.originY + (event.clientY - dragState.startY),
    });

    setCropOffset(nextOffset);
  };

  const handleCropPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setIsDraggingCrop(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (isCroppingLogo) return;
    onOpenChange(nextOpen);
  };

  const handleCropApply = async () => {
    if (!cropSourceUrl) return;

    setIsCroppingLogo(true);
    try {
      const croppedFile = await createCroppedTeamLogoFile({
        imageSrc: cropSourceUrl,
        originalName: cropOriginalName,
        cropSize: CROP_PREVIEW_SIZE,
        zoom: cropZoom,
        offsetX: cropOffset.x,
        offsetY: cropOffset.y,
      });

      await onComplete(croppedFile);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '이미지 편집에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsCroppingLogo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>로고 영역 조정</DialogTitle>
          <DialogDescription>
            드래그해서 위치를 옮기고 확대/축소해 노출 영역을 맞춰주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex justify-center">
            <div
              className="relative overflow-hidden rounded-full border border-slate-200 bg-slate-50"
              style={{ width: CROP_PREVIEW_SIZE, height: CROP_PREVIEW_SIZE, touchAction: 'none' }}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
              onWheel={handleCropWheel}
            >
              {cropSourceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cropSourceUrl}
                  alt="업로드한 팀 로고"
                  draggable={false}
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    setCropImageNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 select-none"
                  style={{
                    width: previewImageSize?.width ?? CROP_PREVIEW_SIZE,
                    height: previewImageSize?.height ?? CROP_PREVIEW_SIZE,
                    transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`,
                    transformOrigin: 'center',
                    transition: isDraggingCrop ? 'none' : 'transform 120ms ease-out',
                  }}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>확대/축소</span>
              <span>{cropZoom.toFixed(2)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => applyCropZoom(cropZoom - CROP_ZOOM_STEP)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[cropZoom]}
                min={CROP_MIN_ZOOM}
                max={CROP_MAX_ZOOM}
                step={0.01}
                onValueChange={handleCropZoomChange}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => applyCropZoom(cropZoom + CROP_ZOOM_STEP)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">드래그로 위치 이동, 마우스 휠로 확대/축소할 수 있습니다.</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" disabled={isCroppingLogo} onClick={handleCropReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              위치 초기화
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isCroppingLogo}
              onClick={() => handleDialogOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={isUploadingLogo || isCroppingLogo || !cropSourceUrl}
              onClick={handleCropApply}
            >
              {isCroppingLogo ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 text-white" />
                  적용 중...
                </>
              ) : (
                '이 영역으로 사용하기'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
