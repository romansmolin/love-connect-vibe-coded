'use client'

import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export const CityFilter = ({ onApply, onClear }: { onApply: (city?: string) => void; onClear: () => void }) => {
    const [city, setCity] = useState('')

    return (
        <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="city-filter">Filter by city</Label>
                    <Input
                        id="city-filter"
                        placeholder="e.g. Paris"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onApply(city.trim() || undefined)}>Apply</Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setCity('')
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
