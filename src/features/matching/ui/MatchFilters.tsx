'use client'

import { useState } from 'react'

import { Filter, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

export type MatchGender = 'men' | 'women' | 'couple'

export const MatchFilters = ({
    onApply,
    onClear,
}: {
    onApply: (filters: { city?: string; gender?: MatchGender }) => void
    onClear: () => void
}) => {
    const [city, setCity] = useState('')
    const [gender, setGender] = useState('all')

    const handleApply = () => {
        onApply({
            city: city.trim() || undefined,
            gender: gender === 'all' ? undefined : (gender as MatchGender),
        })
    }

    const handleClear = () => {
        setCity('')
        setGender('all')
        onClear()
    }

    return (
        <Card className="flex flex-row flex-wrap items-end gap-3 p-3">
            <div className="flex items-center gap-2 pb-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
            </div>
            <Input
                className="w-36"
                placeholder="City, e.g. Paris"
                value={city}
                onChange={(event) => setCity(event.target.value)}
            />
            <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-36">
                    <SelectValue placeholder="Everyone" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="couple">Couples</SelectItem>
                </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={handleApply}>
                    Apply
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClear}>
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            </div>
        </Card>
    )
}
