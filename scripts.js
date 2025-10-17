let myBooks = [];
const bookshelfContainer = document.querySelector('.bookshelf'),
    bookCount = document.querySelector('#bookCount'),
    pageCount = document.querySelector('#pageCount'),
    averagePages = document.querySelector('#averagePages'),
    uniqueAuthors = document.querySelector('#uniqueAuthors'),
    bookInputForm = document.querySelector('#bookInputForm'),
    formBookTitle = document.querySelector('#bookTitle'),
    formBookAuthor = document.querySelector('#bookAuthor'),
    formBookPages = document.querySelector('#bookPages'),
    formBookStatus = document.querySelector('#bookStatus'),
    submitBookButton = document.querySelector('#submitBook');

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
    const bookItem = document.createElement("div");

    const bookControls = document.createElement('div'),
    deleteButton = document.createElement('button'),
    changeBookInfoButton = document.createElement('button'),
    trash = document.createElement('img'),
    editBook = document.createElement('img');
    
    bookControls.classList.add('bookControls');
    trash.src = 'img/delete.svg';
    editBook.src = 'img/book-edit.svg';
    deleteButton.classList.add('bookControlButton');
    deleteButton.classList.add('trashBook');
    changeBookInfoButton.classList.add('bookControlButton');
    changeBookInfoButton.classList.add('modifyBook');
    deleteButton.dataset.targetID = book.id;

    changeBookInfoButton.appendChild(editBook);
    deleteButton.appendChild(trash);
    bookControls.appendChild(changeBookInfoButton);
    bookControls.appendChild(deleteButton)    
    
    const rotationValue = getRandomRotation(-2.5, 2.5)
    bookItem.classList.add("bookItem");

    bookItem.dataset.id = book.id;

    bookItem.classList.add("bookItem")
    bookItem.style.setProperty('--rand-rot', rotationValue)
    bookItem.style.setProperty('backface-visibility', 'hidden')
    bookItem.style.setProperty('-webkit-backface-visibility', 'hidden')

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
            bookItem.appendChild(bookControls);
        };
    };

    bookshelfContainer.appendChild(bookItem);
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
    pageCount.textContent = `${totalPages}`
    averagePages.textContent = `${Math.round(averagePagesValue)}`
    uniqueAuthors.textContent = `${uniqueAuthorSet.size}`
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

function removeBookFromLibrary(library, id) {
    // Find book w/ ID in library and get its index
    const bookToRemove = library.findIndex(book => book.id === id);
    // Remove the book in library
    const tempShelf = library.splice(bookToRemove, 1);
    // Remove the book from the visible library
    const bookCard = document.querySelector(`[data-id="${id}"]`)
    bookCard.remove()

    console.log(`Successfully removed book with id ${id}`)
}

// Interaction codes

document.addEventListener('DOMContentLoaded', () => {
  const openPopupBtn = document.querySelector('#addBook'),
  closePopupBtn = document.querySelector('#closePopupBtn'),
  myPopup = document.querySelector('#addBookMenu');

  openPopupBtn.addEventListener('click', () => {
    myPopup.style.display = 'block';
  });

  closePopupBtn.addEventListener('click', () => {
    myPopup.style.display = 'none';
  });

  // Optional: Close pop-up when clicking outside the content
  window.addEventListener('click', (event) => {
    if (event.target === myPopup) {
      myPopup.style.display = 'none';
    }
  });
});

bookInputForm.addEventListener('submit', (event) => {
    const inputForm = document.querySelector('#addBookMenu');

    event.preventDefault();
    submitBookButton.disabled = true; // Prevents doubled inputs!
    
    const title = formBookTitle.value,
    author = formBookAuthor.value,
    pages = Number(formBookPages.value),
    readStatus = formBookStatus.value;

    console.log(`Title: ${title}\n
        Author: ${author}\n
        Pages: ${pages}\n
        Read? ${readStatus}`)

    addBookToLibrary(title, author, pages, readStatus);
    loadBookIntoShelf(myBooks[myBooks.length - 1])

    inputForm.style.display = 'none';
});

bookshelfContainer.addEventListener('click', (event) => {
    const trashButton = event.target.closest('.trashBook');
    console.log(trashButton)
    
    if (trashButton) {
        const bookID = trashButton.dataset.targetID;
        console.log(bookID)

        removeBookFromLibrary(myBooks, bookID);
    }
})

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