import { Outlet, ReactLocation, Router } from '@tanstack/react-location'

import { Layout } from './Layout'
import { ThemeProvider } from './ThemeContext'

export const Root = () => {
  const location = new ReactLocation()

  return (
    <Router
      location={location}
      routes={[
        {
          path: '/',
          element: (
            <div>
              <h1 className="text-3xl font-bold underline dark:text-green-200">
                Hellorld!
              </h1>
              1sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf1
              2sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf2
              3sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf3
              4sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf4
              5sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf5
              6sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf6
              7sqskljhlksqdhflksjdhflskjhfslkdhfklshfsldkjfhsldfhslkhfslkdhfskljdfhskjdhfslkdhfslkjdhfsldkhflskdjhfslkjdhflksdjhflksjhlfshldfkhslkdfhslkjhdflskhdflkjsdhfskjhfslkjdhfskjlhdfslkjdhfslkdjfhslkdhfslkjdhgflksjhflskdfhdkjhqsdqmsdlkhsdkjfhskjfljhqlkhlqskjhdqlshkljdhlkfhgsdhgghfhhfjjfjqsjjmljqmlkjdqmljqmljmqjmlkdjmlsqkjsdmlkjqmldkjfmlqsjdfmlksqjdmlksqjfdmlkqjsdmlkjfsqmlkdjqmlkjdmlkjfqsmlkjdfmlkjf7
            </div>
          ),
        },
        { path: '/settings', element: 'settings' },
        { path: '/*', element: 'not found' },
      ]}
    >
      <ThemeProvider>
        <Layout>
          <Outlet />
        </Layout>
      </ThemeProvider>
    </Router>
  )
}
