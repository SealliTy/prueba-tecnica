export const FormData = (date: string) => {
    const parseDate = new Date(date)

    const year = parseDate.getFullYear()
    const month = parseDate.getMonth() + 1
    const day = parseDate.getDate()

    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
}