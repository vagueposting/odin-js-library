let myBooks = [];
const bookCount = document.querySelector('#bookCount'),
    pageCount = document.querySelector('#pageCount'),
    averagePages = document.querySelector('#averagePages'),
    uniqueAuthors = document.querySelector('#uniqueAuthors');


function Book(title, author, pages, readStatus) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
    this.readStatus = readStatus;
};

function addBookToLibrary(title, author, pages, readStatus) {
    myBooks.push(new Book(title, author, pages, readStatus))
};

function loadBookIntoShelf(book) {
    const container = document.querySelector(".bookshelf") // TODO: change to final assignment
    const bookItem = document.createElement("div");
    
    const rotationValue = getRandomRotation(-2.5, 2.5)
    bookItem.classList.add("bookItem");

    bookItem.dataset.id = book.id;

    bookItem.classList.add("bookItem")
    bookItem.style.setProperty('--rand-rot', rotationValue)

    for (const [key, value] of Object.entries(book)) {
        if (key != 'id' && value !== null && value !== undefined) {
            const infoKey = document.createElement("span");
            const infoValue = document.createElement("span");
            const lineBreak = document.createElement("br");

            infoKey.classList.add("bookInfoHeader")
            
            const displayKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            
            infoKey.textContent = `${displayKey}: `;

            if (key === 'title') {
                infoValue.classList.add("bookTitle")
            }

            if (key === 'readStatus') {
                if (book.readStatus) {
                    infoValue.textContent = 'Read';
                } else {
                    infoValue.textContent = 'Not read yet';
                }
            } else {
                infoValue.textContent = `${value}`;
            }

            bookItem.appendChild(infoKey);
            bookItem.appendChild(infoValue);
            bookItem.appendChild(lineBreak);
        };
    };

    container.appendChild(bookItem);
    updateBookStats(myBooks)
};

function updateBookStats(library) {
    /* Compute page count */
    if (library.length > 0) {
    const pagesPerBook = library.map(item => item.pages);
    const totalPages = pagesPerBook.reduce((accumulator, currentValue) =>
        accumulator + currentValue);
    const averagePagesValue = totalPages / library.length;
    /* Compute unique authors */
    const uniqueAuthorSet = new Set(
        library.map(item => item.author));

    /* Set stat values */
    bookCount.textContent = `${library.length}`;
    pageCount.textContent = `${totalPages} pages`
    averagePages.textContent = `${Math.round(averagePagesValue)} pages/book`
    uniqueAuthors.textContent = `${uniqueAuthorSet.size} authors`
    } else {
        bookCount.textContent = `0`;
    pageCount.textContent = `0`
    averagePages.textContent = `0`
    uniqueAuthors.textContent = `0`
    }
}

function getRandomRotation(min, max) {
    const rotation = Math.random() * (max - min) + min;
    
    return `${rotation.toFixed(1)}deg`;
}

// Test runs

updateBookStats(myBooks);

/*addBookToLibrary("Moby Dick",
    "Herman Melville", 544, false
);*/

addBookToLibrary("Wuthering Heights",
    "Emily Brontë", 416, true
)

addBookToLibrary("The Odyssey", "Homer",
    140, true
)

addBookToLibrary("The Giving Tree", "Shel Silverstein",
    64, false
)


myBooks.forEach((book) => {
    loadBookIntoShelf(book);
});

