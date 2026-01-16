import React from 'react'

import { cn } from '@/shared/lib/utils'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'

interface GenericSelectProps<Option> {
    handleSelect: (value: string) => void
    selectValue: string
    options: ReadonlyArray<Option>
    placeholder: string
    getOptionLabel?: (option: Option) => React.ReactNode
    getOptionValue?: (option: Option) => string
    emptyOption?: { value: string; label: React.ReactNode }
    disabled?: boolean
    selectLabel?: string
    selectTriggerClass?: string
}

export function GenericSelect<Option>({
    handleSelect,
    selectValue,
    options,
    placeholder,
    getOptionLabel,
    getOptionValue,
    emptyOption,
    selectLabel,
    disabled = false,
    selectTriggerClass = '',
}: GenericSelectProps<Option>) {
    const resolveLabel = getOptionLabel ?? ((option: Option) => String(option))
    const resolveValue = getOptionValue ?? ((option: Option) => String(option))

    return (
        <Select disabled={disabled} value={selectValue} onValueChange={handleSelect}>
            <SelectTrigger className={cn('!h-10', selectTriggerClass)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
                <SelectGroup>
                    {selectLabel && <SelectLabel>{selectLabel}</SelectLabel>}
                    {emptyOption ? <SelectItem value={emptyOption.value}>{emptyOption.label}</SelectItem> : null}
                    {options.map((option) => {
                        const value = resolveValue(option)
                        const label = resolveLabel(option)

                        return (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        )
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
