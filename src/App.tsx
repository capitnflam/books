import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'

import { Book } from './components/Book'

export const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button
            type="button"
            onClick={() => setCount((currentCount) => currentCount + 1)}
          >
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <Book
          authors={['Isaac Asimov', 'Dan Brown']}
          cover={logo}
          isbn="9780345317988"
          synopsis="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut imperdiet, enim in tempus sollicitudin, lectus eros blandit erat, ac venenatis nibh diam at nunc. Maecenas gravida fringilla ligula id molestie. Suspendisse posuere vitae lacus in auctor. Curabitur vel urna massa. Sed sit amet turpis vel elit imperdiet pellentesque. In hac habitasse platea dictumst. Vivamus pellentesque enim eu ultrices venenatis. Fusce ante odio, varius vitae fermentum non, interdum ac purus. Nullam aliquet diam et massa elementum euismod. Maecenas ut augue vitae purus maximus fringilla. Nam efficitur urna ut nisl fermentum pharetra. Vivamus hendrerit elit efficitur finibus euismod. "
          title="foobar"
        />
        {/* <Book variant="outlined" content="foobar outlined" /> */}
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}
