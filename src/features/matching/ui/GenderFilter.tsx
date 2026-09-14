'use client'

import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

export type MatchGender = 'men' | 'women' | 'couple'

export const GenderFilter = ({
    onApply,
    onClear,
}: {
    onApply: (gender?: MatchGender) => void
    onClear: () => void
}) => {
    const [selectedGender, setSelectedGender] = useState('all')

    return (
        <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="gender-filter">Filter by gender</Label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="w-full" id="gender-filter">
                            <SelectValue placeholder="Everyone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Everyone</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="men">Men</SelectItem>
                            <SelectItem value="couple">Couples</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => onApply(selectedGender === 'all' ? undefined : (selectedGender as MatchGender))}
                    >
                        Apply
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedGender('all')
                            onClear()
                        }}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    )
}
