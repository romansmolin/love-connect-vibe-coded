'use client'

import React from 'react'

import { GenericDialog } from '../components'

interface VideoPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    videoSrc: string
    title?: string
    videoType?: string
}

export const VideoPreviewDialog: React.FC<VideoPreviewDialogProps> = ({
    open,
    onOpenChange,
    videoSrc,
    title = 'Video Preview',
    videoType = 'video/mp4',
}) => {
    const dialogContent = (
        <div className="p-6 pt-4 w-full">
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <video autoPlay controls playsInline className="w-full h-auto max-h-[70vh] object-contain">
                    <source src={videoSrc} type={videoType} />
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
    return (
        <GenericDialog
            dialogContent={dialogContent}
            dialogHeaderDescription={'Check your video one more time!'}
            dialogHeaderTitle={title}
            dialogOpen={open}
            onDialogOpenChange={onOpenChange}
        />
    )
}
