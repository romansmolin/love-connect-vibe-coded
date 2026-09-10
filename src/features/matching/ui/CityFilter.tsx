'use client'

import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import { DEMO_CITIES, type DemoCity } from '../lib/demo-city'

export const CityFilter = ({ onApply, onClear }: { onApply: (city?: DemoCity) => void; onClear: () => void }) => {
    const [selectedCity, setSelectedCity] = useState('all')

    return (
        <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="city-filter">Filter by city</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-full" id="city-filter">
                            <SelectValue placeholder="All cities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All cities</SelectItem>
                            {DEMO_CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                    {city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => onApply(selectedCity === 'all' ? undefined : (selectedCity as DemoCity))}
                    >
                        Apply
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedCity('all')
                            onClear()
                        }}
                    >
                        Clear
                    </Button>
                </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Choose a city to load a larger demo profile pool.</p>
        </div>
    )
}
