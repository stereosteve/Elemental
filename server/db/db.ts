import 'dotenv/config'
import postgres from 'postgres'

export const sql = postgres(process.env.discoveryDbUrl || '', {
  // prepare: false,
  // debug: (_conn, query, args) => {
  //   console.log(query.replaceAll(/\s+/g, ' '), args)
  // },
  types: {
    // many columns are timestamp without time zone
    // which is bad because if developer machine has a timezone set
    // dates will be interpreted to be in the local timezone...
    // which can mess up cursor pagination stuff
    // so here we tell postgres-js not to parse as date
    // and just pass the string value thru directly...
    skipParseDate: {
      to: 1114,
      from: [1114],
      serialize: (v: string) => v,
      parse: (v: string) => v,
    },
  },
})
