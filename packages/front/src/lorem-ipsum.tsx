import { useEffect, useState } from 'react'

type Props = {
  readonly paragraphCount?: number
}

export function LoremIpsum({ paragraphCount = 5 }: Props) {
  const [data, setData] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(
      `https://baconipsum.com/api/?type=meat-and-filler&paras=${paragraphCount}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`)
        }
        return response.json()
      })
      .then((resData) => {
        setData(resData)
        setError(null)
      })
      .catch((err) => {
        setError(err)
        setData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [paragraphCount])

  if (loading || error) {
    return <div></div>
  }

  if (data) {
    return (
      <div>
        {data.map((element, idx) => (
          <p key={`lorem-${idx}`}>{element}</p>
        ))}
      </div>
    )
  }

  return <div></div>
}
