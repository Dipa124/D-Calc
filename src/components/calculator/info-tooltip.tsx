'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface InfoTooltipProps {
  text: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function InfoTooltip({ text, side = 'right' }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground/60 hover:text-copper hover:bg-copper/10 transition-colors cursor-help"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className="max-w-[260px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg rounded-lg px-3 py-2"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
