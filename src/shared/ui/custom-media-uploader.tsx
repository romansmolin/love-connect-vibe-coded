'use client'

import React, { useCallback, useMemo, useState } from 'react'

import { PlusCircleIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { FileRejection, useDropzone } from 'react-dropzone'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

interface CustomMediaUploaderProps {
    onFileSelect: (files: File[]) => void
    previewUrls?: string[]
    setPreviewUrls?: (urls: string[]) => void
    description: string
    showPreview?: boolean
    maxFiles?: number
    onlyImage?: boolean
    className?: string
    dropzoneClassName?: string
}

export const CustomMediaUploader: React.FC<CustomMediaUploaderProps> = ({
    onFileSelect,
    previewUrls = [],
    setPreviewUrls,
    showPreview = false,
    maxFiles = 1,
    description,
    onlyImage = false,
    className,
    dropzoneClassName,
}) => {
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setError(null)
            if (!acceptedFiles) return

            if (previewUrls.length > 0) {
                previewUrls.forEach((url) => URL.revokeObjectURL(url))
            }

            if (showPreview && acceptedFiles.length > 0) {
                const localPreviewUrls = acceptedFiles.map((file) => URL.createObjectURL(file))
                setPreviewUrls?.(localPreviewUrls)
            }

            onFileSelect(acceptedFiles)
        },
        [onFileSelect, previewUrls, setPreviewUrls, showPreview]
    )

    const onDropRejected = useCallback((rejections: FileRejection[]) => {
        if (!rejections.length) return
        const err = rejections[0].errors[0]
        switch (err.code) {
            case 'file-too-large':
                setError('Max file size is 50 MB.')
                break
            case 'file-invalid-type':
                setError('Unsupported file type.')
                break
            case 'too-many-files':
                setError('Maximum 10 files allowed.')
                break
            default:
                setError(err.message)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        maxFiles,
        maxSize: 50 * 1024 * 1024,
        accept: {
            'image/png': [],
            'image/jpg': [],
            'image/jpeg': [],
            'image/webp': [],
            ...(!onlyImage ? { 'video/*': [] } : {}),
        },
    })

    const hasVideo = useMemo(
        () =>
            previewUrls.some(
                (url) =>
                    url.includes('video') ||
                    url.includes('.mp4') ||
                    url.includes('.mov') ||
                    url.includes('.webm') ||
                    url.includes('.MP4')
            ),
        [previewUrls]
    )

    const shouldShowClearButton = showPreview && previewUrls.length > 0 && !!setPreviewUrls

    return (
        <div className={cn('flex flex-col gap-2 flex-1', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'border border-dashed border-primary bg-card rounded-md p-5 flex justify-center items-center transition-colors duration-300 w-full h-[360px] overflow-hidden',
                    isDragActive && 'bg-primary/50',
                    dropzoneClassName
                )}
            >
                <input {...getInputProps()} />

                {showPreview && previewUrls.length > 0 ? (
                    <div
                        className="relative w-full h-full flex justify-center items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {previewUrls.length === 1 ? (
                            hasVideo ? (
                                <video
                                    controls
                                    className="w-full h-full object-contain rounded"
                                    src={previewUrls[0]}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <img
                                    alt="Preview"
                                    className="w-full h-full object-contain rounded"
                                    src={previewUrls[0]}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )
                        ) : (
                            <Carousel className="w-full h-full">
                                <CarouselContent className="h-full">
                                    {previewUrls.map((previewUrl) => (
                                        <CarouselItem key={previewUrl} className="h-full">
                                            <div className="p-2 h-full">
                                                <div className="flex items-center justify-center h-full">
                                                    <Image
                                                        alt="Post preview"
                                                        className="w-full h-full object-contain rounded-lg"
                                                        height={300}
                                                        src={previewUrl}
                                                        width={300}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="-left-4" />
                                <CarouselNext className="-right-4" />
                            </Carousel>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 justify-center items-center text-center">
                        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted/40 text-primary">
                            <PlusCircleIcon className="h-10 w-10" />
                        </div>

                        {isDragActive ? (
                            <div>File uploading...</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <span className="italic">{description}</span>
                                <Button size="lg">
                                    <PlusCircleIcon />
                                    Select files
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {shouldShowClearButton && (
                <Button className="w-full" size="lg" variant="destructive" onClick={() => setPreviewUrls?.([])}>
                    <Trash2 />
                    Clear media
                </Button>
            )}

            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
    )
}
