export function Stat({ value, label }: { value?: number; label: string }) {
  if (!value) return null
  return (
    <div>
      <div className="font-bold">{value}</div>
      <div className="uppercase text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
