// import React from 'react'
import { render } from '@testing-library/react'

const TestApp = () => <div>Hello World!</div>

test('hello world', async () => {
  const rendered = render(<TestApp />)

  const content = await rendered.findByText('Hello World!')

  expect(content).toBeDefined()
})
