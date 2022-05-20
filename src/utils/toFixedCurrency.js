export const toFixedCurrency = (n, d) => {
  if ((1.005).toFixed(2) == '1.01') {
    return n.toFixed(d)
  }
  const split = n.toString().split('.')

  if (split[1] && split[1].length === 1) {
    split[1] += '0'
  }

  const number = +(!split[1] ? split[0] : `${split.join('.')}1`)
  const numberWithCommaSeparator = number
    .toFixed(d)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return numberWithCommaSeparator
}
