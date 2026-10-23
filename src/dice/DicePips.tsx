const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]]

export function DicePips({ value }: { value: number | null }) {
  return <span className={`dice-pips${value === null ? ' dice-unknown' : ''}`} role="img" aria-label={value === null ? 'Unknown roll' : `${value}`}>
    {value === null ? '?' : Array.from({ length: 9 }, (_, index) => <i key={index} className={PIPS[value].includes(index) ? 'pip-on' : ''} />)}
  </span>
}
