import { ColumnSort } from '@tanstack/react-table'

export const sortCodec = {
  encode(state: ColumnSort[]) {
    const pairs = state.map((s) => s.id + '~' + (s.desc ? 'desc' : 'asc'))
    // console.log(state, pairs)
    return pairs.join('~~')
  },
  decode(val: string) {
    const pairs = val.split('~~')
    return pairs.map((p) => {
      const [id, desc] = p.split('~')
      return { id, desc: desc == 'desc' }
    })
  },
}
