export const capitalizeFirstLetter  = (value: string) => {
    return value.replace(/^./, char => char.toUpperCase());
}