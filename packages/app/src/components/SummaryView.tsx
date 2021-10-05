import { useQuery } from '@apollo/client'
import { SUMMARY_VIEW_QUERY } from '../constants/queries'
// #            expiry:1633132800,
//   #            optionType:"CALL",
//   #            baseAsset:"0x581b4ebe86df2a81fd845a016119416f83fe032d",
//   #            quoteAsset:"0x0000000000000000000000000000000000000000"

function SummaryView() {
  const { loading, error, data } = useQuery(SUMMARY_VIEW_QUERY, {
    variables: {
      expiry:1634774400,
      optionType: 'PUT',
      baseAsset: '0x581b4ebe86df2a81fd845a016119416f83fe032d',
      quoteAsset: '0x0000000000000000000000000000000000000000'
    }
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: ${error}</p>
  // console.log(data);

  return <div/>

}

export default SummaryView;
