export function formatNumber(number?: number) {
  if (number == undefined) return ''
  if (number < 1000) {
    return number.toString()
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else {
    return (number / 1000000).toFixed(1) + 'M'
  }
}
