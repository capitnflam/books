import { BookCard } from './BookCard'
import { Link } from './Link'

export const Home = () => {
  return (
    <div className="space-x-3 space-y-3">
      <h1 className="text-3xl font-bold underline dark:text-green-200">
        Hellorld!
      </h1>
      <Link to="/settings" className="bg-red-500">
        foo
      </Link>
      <Link to="http://www.google.com" className="bg-yellow-500">
        bar
      </Link>
      <div className="flex flex-col gap-3">
        <div className="columns-4">
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
            summary="Lorem, ipsum dolor sit amet consectetur adipisicing elit. In sint, quidem facilis quaerat hic porro, ullam, illum magnam autem inventore at pariatur. Dolor eveniet rem accusamus veniam quidem ipsum quae?"
          />
          <BookCard
            isbn="978-2-7654-0912-0"
            title="Manuel de bibliographie générale"
            cover="https://via.placeholder.com/512"
            authors={['foo bar', 'bar foo']}
          />
        </div>
      </div>
    </div>
  )
}
