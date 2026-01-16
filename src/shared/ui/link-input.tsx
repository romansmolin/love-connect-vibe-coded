import React, { KeyboardEvent, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'

import { Badge } from './badge'
import { Button } from './button'
import { Input } from './input'

interface TagInputProps {
    links: string[]
    currentLink: string
    onLinkChange: (tag: string) => void
    onAddLink: (link: string) => void
    onRemoveLink: (index: number) => void
    onClearLinks: () => void
    placeholder?: string
    maxLinks?: number
    className?: string
}

export const LinkInput: React.FC<TagInputProps> = ({
    links,
    currentLink,
    onLinkChange,
    onAddLink,
    onRemoveLink,
    onClearLinks,
    placeholder = 'Add a tag...',
    maxLinks = 1,
    className = '',
}) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            if (currentLink.trim()) {
                onAddLink(currentLink.trim())
            }
        }
    }

    const handleAddClick = () => {
        if (currentLink.trim()) {
            onAddLink(currentLink.trim())
        }
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Input Section */}
            <div className="flex gap-2">
                <Input
                    className="flex-1"
                    disabled={links.length >= maxLinks}
                    placeholder={placeholder}
                    value={currentLink}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onLinkChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyPress={handleKeyPress}
                />
                <Button
                    disabled={!currentLink.trim() || links.length >= maxLinks}
                    type="button"
                    variant="outline"
                    onClick={handleAddClick}
                >
                    <Plus className="h-4 w-4" />
                </Button>

                {links.length > 0 && (
                    <Button type="button" variant={'destructive'} onClick={onClearLinks}>
                        <Minus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tags Display */}
            {links.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Links ({links.length}/{maxLinks})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {links.map((tag, index) => (
                            <Badge key={index} className="flex items-center gap-1 px-2 py-1">
                                <span className="text-xs">{tag}</span>
                                <Button
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onRemoveLink(index)}
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
                    Press Enter or comma to add tag. Maximum {maxLinks} tags allowed.
                </p>
            )}
        </div>
    )
}
