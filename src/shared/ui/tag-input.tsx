import React, { KeyboardEvent, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'

import { Badge } from './badge'
import { Button } from './button'
import { Input } from './input'

interface TagInputProps {
    tags: string[]
    currentTag: string
    onTagChange: (tag: string) => void
    onAddTag: (tag: string) => void
    onRemoveTag: (index: number) => void
    onClearTags: () => void
    placeholder?: string
    maxTags?: number
    className?: string
    isDisabled?: boolean
}

export const TagInput: React.FC<TagInputProps> = ({
    tags,
    currentTag,
    onTagChange,
    onAddTag,
    onRemoveTag,
    onClearTags,
    placeholder = 'Add a tag...',
    maxTags = 10,
    className = '',
    isDisabled,
}) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            if (currentTag.trim()) {
                onAddTag(currentTag.trim())
            }
        }
    }

    const handleAddClick = () => {
        if (currentTag.trim()) {
            onAddTag(currentTag.trim())
        }
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Input Section */}
            <div className="flex gap-2">
                <Input
                    className="flex-1"
                    disabled={tags.length >= maxTags || isDisabled}
                    placeholder={placeholder}
                    value={currentTag}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onTagChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyPress={handleKeyPress}
                />
                <Button
                    disabled={!currentTag.trim() || tags.length >= maxTags || isDisabled}
                    type="button"
                    variant="outline"
                    onClick={handleAddClick}
                >
                    <Plus className="h-4 w-4" />
                </Button>

                {tags.length > 0 && (
                    <Button type="button" variant={'destructive'} onClick={onClearTags}>
                        <Minus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Tags ({tags.length}/{maxTags})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <Badge key={index} className="flex items-center gap-1 px-2 py-1">
                                <span className="text-xs">{tag}</span>
                                <Button
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    disabled={isDisabled}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onRemoveTag(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Helper Text */}
            {isFocused && (
                <p className="text-xs text-muted-foreground">
                    Press Enter or comma to add tag. Maximum {maxTags} tags allowed.
                </p>
            )}
        </div>
    )
}
