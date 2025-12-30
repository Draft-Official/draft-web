"use client"

import * as React from "react"
// Removed invalid import
// Actually Shadcn's use-mobile usually exports `useIsMobile`. Let me check the file content if possible, but standard is `hooks/use-mobile.tsx` or `components/ui/use-mobile.ts`. 
// I will assume it's at components/ui/use-mobile.ts based on previous listing.

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// We need to implement useIsMobile if it's not standard. 
// Based on file listing, we have `components/ui/use-mobile.ts`.

import { useIsMobile } from "@/components/ui/use-mobile"

interface ApplicationFormProps {
    applied: boolean
    setApplied: (val: boolean) => void
    onComplete: () => void
}

function ApplicationForm({ className, onComplete }: React.ComponentProps<"form"> & { onComplete: () => void }) {
    const [showConfirm, setShowConfirm] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setShowConfirm(true)
    }

    const handleConfirm = () => {
        setShowConfirm(false)
        onComplete()
    }

    return (
        <>
            <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input id="nickname" placeholder="조던23" required />
                </div>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="position">포지션</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="포지션 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pg">포인트 가드</SelectItem>
                            <SelectItem value="sg">슈팅 가드</SelectItem>
                            <SelectItem value="sf">스몰 포워드</SelectItem>
                            <SelectItem value="pf">파워 포워드</SelectItem>
                            <SelectItem value="c">센터</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="height">키 (cm)</Label>
                    <Input id="height" type="number" placeholder="180" required />
                </div>

                <div className="bg-secondary p-3 rounded text-sm text-secondary-foreground">
                    <p className="font-bold mb-1">입금 정보</p>
                    <p>카카오뱅크 3333-01-234567</p>
                    <p>예금주: 김농구</p>
                    <p>금액: 10,000원</p>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full text-lg h-12">
                        입금 확인 및 신청완료
                    </Button>
                </div>
            </form>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>입금을 완료하셨나요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            실제 입금하지 않고 버튼을 누를 경우,<br/>
                            <span className="font-bold text-red-500">허위 사실 유포로 계정이 영구 정지</span>될 수 있습니다.<br/>
                            호스트가 입금 내역을 확인한 후 확정됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            네, 입금했습니다
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export function ApplicationDrawer({
    children,
    open,
    setOpen,
    onApplied
}: {
    children: React.ReactNode
    open?: boolean
    setOpen?: (open: boolean) => void
    onApplied: () => void
}) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isMobile = useIsMobile()

    const isOpen = open !== undefined ? open : internalOpen
    const setIsOpen = setOpen !== undefined ? setOpen : setInternalOpen

    if (!isMobile) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>게스트 신청</DialogTitle>
                    </DialogHeader>
                    <ApplicationForm onComplete={() => {
                        onApplied()
                        setIsOpen(false)
                    }} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>게스트 신청</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 pt-0">
                    <ApplicationForm onComplete={() => {
                        onApplied()
                        setIsOpen(false)
                    }} />
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">취소</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
