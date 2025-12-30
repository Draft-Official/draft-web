'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CounterProps {
    value?: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
}

export function Counter({ value = 0, onChange, min = 0, max = 99, label }: CounterProps) {
    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submit
        if (value > min) onChange(value - 1);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submit
        if (value < max) onChange(value + 1);
    };

    return (
        <div className="flex items-center justify-between py-1">
            {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="h-8 w-8 rounded-md bg-white shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                    type="button"
                >
                    <Minus className="h-4 w-4 text-slate-600" />
                </Button>
                
                <span className="w-6 text-center text-lg font-bold text-slate-900 tabular-nums">
                    {value}
                </span>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="h-8 w-8 rounded-md bg-white shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                    type="button"
                >
                    <Plus className="h-4 w-4 text-slate-600" />
                </Button>
            </div>
        </div>
    );
}
