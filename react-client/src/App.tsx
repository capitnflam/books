import React, { useState } from 'react'

export default function App(): JSX.Element {
  const [foo, setFoo] = useState<number>(0)

  const incFoo = () => {
    setFoo(foo + 1)
  }

  return (
    <div>
      <p>foo count: {foo}</p>
      <input type="button" onClick={incFoo} value="+1" />
    </div>
  )
}
