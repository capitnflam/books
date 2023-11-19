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
  {
    coverURL: 'http://dummyimage.com/249x100.png/dddddd/000000',
    title: 'American Pastime',
    isbn: '580964266-7',
    synopsis: `Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.

Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.

Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris.`,
    authors: [authors[0], authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/243x100.png/ff4444/ffffff',
    title: 'City Heat',
    isbn: '189911596-X',
    synopsis: `Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.`,
    authors: [authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/148x100.png/5fa2dd/ffffff',
    title: 'V2: Dead Angel (Vares 2 - Jäätynyt Enkeli)',
    isbn: '214149563-6',
    synopsis:
      'Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem.',
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/209x100.png/cc0000/ffffff',
    title: 'The Hellions',
    isbn: '807926067-2',
    synopsis: `Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.

Phasellus in felis. Donec semper sapien a libero. Nam dui.`,
    authors: [authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/116x100.png/cc0000/ffffff',
    title: 'Tea For Two',
    isbn: '838298896-2',
    synopsis: `In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.

Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.`,
    authors: [authors[0], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/195x100.png/dddddd/000000',
    title: "No Man's Land",
    isbn: '255974951-3',
    synopsis: `Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.

Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.`,
    authors: [authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/236x100.png/dddddd/000000',
    title:
      "My Mother's Smile (a.k.a. The Religion Hour) (L'ora di religione) (Il sorriso di mia madre)",
    isbn: '072652689-4',
    synopsis: `Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.

Sed ante. Vivamus tortor. Duis mattis egestas metus.

Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/218x100.png/cc0000/ffffff',
    title: 'Jungle Book of Regulations, A (Nie Ma Rozy Bez Ognia)',
    isbn: '816259214-8',
    synopsis:
      'Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.',
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/249x100.png/dddddd/000000',
    title: 'Moon',
    isbn: '799957930-0',
    synopsis: `Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.

Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.`,
    authors: [authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/138x100.png/ff4444/ffffff',
    title: 'Wedding, A',
    isbn: '832513694-4',
    synopsis: `Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.

Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.

In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet.`,
    authors: [authors[0], authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/138x100.png/dddddd/000000',
    title: 'Southbounders',
    isbn: '473521760-6',
    synopsis:
      'Curabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.',
    authors: [authors[0], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/147x100.png/dddddd/000000',
    title: 'Visioneers',
    isbn: '251433789-5',
    synopsis: `In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.

Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.

Sed ante. Vivamus tortor. Duis mattis egestas metus.`,
    authors: [authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/172x100.png/5fa2dd/ffffff',
    title: 'Taken',
    isbn: '782380463-8',
    synopsis: `Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque.

Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.

In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.`,
    authors: [authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/187x100.png/5fa2dd/ffffff',
    title: 'Jekyll & Hyde',
    isbn: '993527497-7',
    synopsis: `Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.

Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/247x100.png/dddddd/000000',
    title: 'Catfish in Black Bean Sauce',
    isbn: '634455408-8',
    synopsis:
      'Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem.',
    authors: [authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/216x100.png/5fa2dd/ffffff',
    title: 'Silent Sonata',
    isbn: '897707245-X',
    synopsis: `Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.

Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.`,
    authors: [authors[0], authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/169x100.png/ff4444/ffffff',
    title: 'Hippie Masala - Forever in India',
    isbn: '686341161-X',
    synopsis: `Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.

Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.

Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.`,
    authors: [authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/229x100.png/5fa2dd/ffffff',
    title: 'Meet the Robinsons',
    isbn: '140159599-5',
    synopsis: `Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.

Curabitur at ipsum ac tellus semper interdum. Mauris ullamcorper purus sit amet nulla. Quisque arcu libero, rutrum ac, lobortis vel, dapibus at, diam.`,
    authors: [authors[0]],
  },
  {
    coverURL: 'http://dummyimage.com/243x100.png/cc0000/ffffff',
    title: 'Mod Squad, The',
    isbn: '478921954-2',
    synopsis: `Fusce consequat. Nulla nisl. Nunc nisl.

Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum.

In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.`,
    authors: [authors[0]],
  },
  {
    coverURL: 'http://dummyimage.com/204x100.png/dddddd/000000',
    title: 'Nothing About Robert (Rien sur Robert)',
    isbn: '101466885-9',
    synopsis:
      'Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.',
    authors: [authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/127x100.png/5fa2dd/ffffff',
    title: 'Year Ago in Winter, A (Im Winter ein Jahr)',
    isbn: '551192909-3',
    synopsis: `Sed ante. Vivamus tortor. Duis mattis egestas metus.

Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/108x100.png/dddddd/000000',
    title: 'Barcelona',
    isbn: '615517351-6',
    synopsis: `Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.

Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/151x100.png/5fa2dd/ffffff',
    title: 'Interview with a Hitman',
    isbn: '731553166-1',
    synopsis: `Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.

Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.

Curabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.`,
    authors: [authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/120x100.png/dddddd/000000',
    title: 'Lizzie McGuire Movie, The',
    isbn: '727712882-6',
    synopsis: `Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.

Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.

Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.`,
    authors: [authors[0], authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/214x100.png/5fa2dd/ffffff',
    title: 'julias eyes',
    isbn: '531104103-X',
    synopsis:
      'Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.',
    authors: [authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/225x100.png/5fa2dd/ffffff',
    title: 'Julia',
    isbn: '852086528-3',
    synopsis:
      'Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.',
    authors: [authors[1]],
  },
  {
    coverURL: 'http://dummyimage.com/215x100.png/dddddd/000000',
    title: 'Julia',
    isbn: '098885530-5',
    synopsis:
      'Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.',
    authors: [authors[0]],
  },
  {
    coverURL: 'http://dummyimage.com/176x100.png/cc0000/ffffff',
    title: 'My Life as McDull (Mak dau goo si)',
    isbn: '613985644-2',
    synopsis: `Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.

Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.

Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/151x100.png/dddddd/000000',
    title: 'D.A.R.Y.L.',
    isbn: '687574689-1',
    synopsis: `Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.

Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero.`,
    authors: [authors[0], authors[1], authors[2]],
  },
  {
    coverURL: 'http://dummyimage.com/160x100.png/ff4444/ffffff',
    title: "Boys Don't Cry (Chlopaki nie placza)",
    isbn: '203099125-2',
    synopsis: `In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.

Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.`,
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
