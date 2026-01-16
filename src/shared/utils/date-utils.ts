function formatDate(dateString?: string) {
    if (!dateString) {
        return ''
    }

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatCompactDate(dateString?: string) {
    if (!dateString) {
        return 'Not scheduled'
    }

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) {
        return 'Not scheduled'
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

export { formatCompactDate,formatDate }
