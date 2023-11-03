import dataSource from './cli.config'

const authors = [
  { name: 'Isaac Asimov' },
  { name: 'Frank Herbert' },
  { name: 'Brian Herbert' },
]

const books = [
  {
    title: 'Foundation',
    isbn: '0-553-29335-4',
    synopsis: `# Per ditia

## Observata lumine

Lorem markdownum pereat *sedens fama* esses salutis: ebur quem, sub notus
fatalia et quasque parva referre ambit rector. Deae quod fila nos Charybdin
curvi. Iuvenem canis Phoebe, vagos manusque fidem. :tada: :foobar:

1. Decus si fugit Pergama
2. Mecum illa coactus pontum tacuit vultibus
3. Quis inque
4. Neu frustraque intumuit

## Plangi visum quaeque vicinia

Ero aut umeri [vinctus](http://dixit.io/herbis-nisi) eluvie non vertitur,
laborem, sedibus non fictumque monendo divitior non? Ipsi heros, haec illis tuis
quid hactenus. Non aquis utrumque, convertit conplexae detractare templa: at
*suos*, axis. Pavor una celate virum vestigia At usque corpore et Memnonis
corpora conde longa bella vertice accipitrem Plura.

- Laetitia Hyperione ungues thalamique laurea procul viam
- Taedasque arduus est ingens spargit nato paene
- Mira tamen
- Et possunt recurva committere domos
- Postquam de quod ingens

## Ille amens minima fraxineam commemorat venerat aures

Dato parato? Et ab [collo et](http://www.et-quoque.io/ida) multis ab non sagitta
fetum. Mea bracchiaque Helicen inmittitur violenta.

Hanc quibus datur. Data quos fecere ista aestu Rhoetei unum. Ora haec nomen
fronde. Gavisa externo praebuit adest ante fidem partem, ferunt officium clamore
Phoenissa me amborum undis cur herba sparsuras nitidam animalia. Exuit
laudaverit ictus sit et pater concita tollere.

## Phoebus eductum

Nempe erat est; praemonitus Invidiae scilicet emoriar restitit, motus indulgens
splendenti in obiecit in iubet? In mactatos vertebar terras. Tibi orsa nulloque;
formosus ludit!

1. Soror dura oris contra
2. In places nomen moderere sparsos alimentaque quos
3. Gravidis nescius aliter libratus pugnare frondes baculi
4. Nec habe pectora

Sicaniam sociis se nomine motus texebas: **super** securim ripa rubefactaque
miserabile dimittere terra moveri dique talis dolores, fecit. Miserisque idem
urget [protinus](http://www.quamait.com/fixus-ut.html) vultus me forem dis,
quod. Aequora que dicere Phlegraeon imagine et carmina primo sit velis recepit
profundum. Disiecit armis! Arbor solebat.`,
    coverURL:
      'https://en.wikipedia.org/wiki/File:Foundation_gnome.jpg#/media/File:Foundation_gnome.jpg',
    authors: [authors[0]],
  },
  {
    title: 'Foundation and Empire',
    isbn: '0-553-29337-0',
    synopsis: 'second entry',
    coverURL:
      'https://en.wikipedia.org/wiki/File:Foundation_and_empire.jpg#/media/File:Foundation_and_empire.jpg',
    authors: [authors[0]],
  },
  {
    title: 'Second Foundation',
    isbn: '0-553-29336-2',
    synopsis: 'third entry',
    coverURL:
      'https://en.wikipedia.org/wiki/File:Second_foundation.jpg#/media/File:Second_foundation.jpg',
    authors: [authors[0]],
  },
  {
    title: 'Dune',
    isbn: '978-0441172719',
    synopsis: 'setup',
    authors: [authors[1]],
  },
  {
    title: 'Prelude to Dune',
    isbn: '978-0593354964',
    synopsis: 'setup',
    authors: [authors[1], authors[2]],
  },
]

const collections = [
  {
    name: 'Foundation',
    books: [books[0], books[1], books[2]],
  },
  { name: 'Dune', books: [books[3], books[4]] },
]

dataSource
  .initialize()
  .then(async (source) => {
    const authorRepository = source.getRepository('AuthorEntity')
    const bookRepository = source.getRepository('BookEntity')
    const collectionRepository = source.getRepository('CollectionEntity')

    await authorRepository.save(authors)
    await bookRepository.save(books)
    await collectionRepository.save(collections)
  })
  .catch(function (error) {
    console.error('Error: ', error)
  })

// var typeorm = require("typeorm")

// var dataSource = new typeorm.DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5432,
//     username: "test",
//     password: "admin",
//     database: "test",
//     synchronize: true,
//     entities: [require("./entity/Post"), require("./entity/Category")],
// })

// dataSource
//     .initialize()
//     .then(function () {
//         var category1 = {
//             name: "TypeScript",
//         }
//         var category2 = {
//             name: "Programming",
//         }

//         var post = {
//             title: "Control flow based type analysis",
//             text: "TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters.",
//             categories: [category1, category2],
//         }

//         var postRepository = dataSource.getRepository("Post")
//         postRepository
//             .save(post)
//             .then(function (savedPost) {
//                 console.log("Post has been saved: ", savedPost)
//                 console.log("Now lets load all posts: ")

//                 return postRepository.find()
//             })
//             .then(function (allPosts) {
//                 console.log("All posts: ", allPosts)
//             })
//     })
//     .catch(function (error) {
//         console.log("Error: ", error)
//     })
