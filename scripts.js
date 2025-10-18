let myBooks = [];
const bookshelfContainer = document.querySelector('.bookshelf'),
    // Book stats
    bookCount = document.querySelector('#bookCount'),
    pageCount = document.querySelector('#pageCount'),
    averagePages = document.querySelector('#averagePages'),
    uniqueAuthors = document.querySelector('#uniqueAuthors'),
    bookInputForm = document.querySelector('#bookInputForm'),
    // Book form
    addBookButton = document.querySelector('#addBook'),
    addBookForm = document.querySelector('#addBookMenu'),
    closeAddBookForm = document.querySelector('#closeAddBookForm'),
    // Book Information
    formBookTitle = document.querySelector('#bookTitle'),
    formBookAuthor = document.querySelector('#bookAuthor'),
    formBookPages = document.querySelector('#bookPages'),
    formBookStatus = document.querySelector('#bookStatus'),
    submitBookButton = document.querySelector('#submitBook')
    // Confirm to delete books
    confirmWindow = document.querySelector('#confirmBookDeletion');

let bookIDToDelete = null;

class Book {
    constructor(title, author, pages, readStatus) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
    this.readStatus = readStatus;
}};

/**
 * Lets you add a book to the library.
 * @param {Array} library - the library array 
 * @param {String} title -
 * @param {String} author 
 * @param {Number} pages 
 * @param {Boolean} readStatus 
 */

function addBookToLibrary(library, title, author, pages, readStatus) {
    library.push(new Book(title, author, pages, readStatus))
};

/** 
 * Inserts an identified book into the user-side library.
 * 
 * @param {Object} book - the book object found in 
 * the myBooks array
 */


function loadBookIntoShelf(book) {
    // Init book item div
    const bookItem = document.createElement("div");

    // Generate buttons
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

    bookItem.style.setProperty('--rand-rot', rotationValue)
    bookItem.style.setProperty('backface-visibility', 'hidden')
    bookItem.style.setProperty('-webkit-backface-visibility', 'hidden')

    bookItem.dataset.id = book.id;

    modifyBookItemInfo(bookItem, book);
    bookItem.appendChild(bookControls)

    bookshelfContainer.appendChild(bookItem);
    updateBookStats(myBooks)
};

/** 
 * Gets the information of a "book" and modifies its 
 * associated div.
 * 
 * @param {HTMLElement} bookItem - the div containing the book's
 * information.
 * @param {Object} book - the book object found in 
 * the myBooks array
 */

function modifyBookItemInfo(bookItem, book) {
    while (bookItem.lastChild && bookItem.lastChild !== bookControls) {
        bookItem.removeChild(bookItem.lastChild);
    }

    for (const [key, value] of Object.entries(book)) {
        if (key != 'id' && value !== null && value !== undefined) {
            const infoKey = document.createElement("span");
            const infoValue = document.createElement("span");
            const lineBreak = document.createElement("br");

            let displayKey = ""

            infoKey.classList.add("bookInfoHeader")
            
            if (key != 'readStatus') {
                displayKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())}
                else {
                    displayKey = "Read?"
                };            

            if (key === 'title') {
                infoValue.classList.add("bookTitle")
            }

            if (key === 'readStatus') {
                infoValue.style.position = 'relative';
                infoKey.style.position = 'relative';

                infoKey.textContent = `${displayKey} `;
                if (book.readStatus) {
                    infoValue.textContent = '✔';
                    infoValue.style.fontSize = '1.6rem';
                    infoKey.style.top = '-0.7rem';
                    infoValue.style.top = '-0.4rem';
                } else {
                    infoValue.textContent = '✘';
                    infoValue.style.fontSize = '1.4rem';
                    infoKey.style.top = '-0.5rem';
                    infoValue.style.top = '-0.3rem';
                }
            } else {
                infoKey.textContent = `${displayKey}: `;
                infoValue.textContent = `${value}`;
            }

            bookItem.appendChild(infoKey);
            bookItem.appendChild(infoValue);
            bookItem.appendChild(lineBreak);
        };
    };

    return bookItem;
}

function modifyBook(library, bookID) {
    console.log('This function exists!')

    targetBook = 

    modifyBookItemInfo()
}

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
    // Remove the book from the visible library
    const bookCard = document.querySelector(`[data-id="${id}"]`)
    if (bookCard) {
        bookCard.remove()
    }
    library.splice(bookToRemove, 1);
    updateBookStats(library);
}

function popupController(open, close, divPopup) {
    // querySelect DOM items first!
    open.addEventListener('click', () => {
        divPopup.style.display = 'block';
    })

    close.addEventListener('click', () => {
        divPopup.style.display = 'none';
    })

    window.addEventListener('click', (event) => {
        if (event.target === divPopup) {
            divPopup.style.display = 'none';
        }
    })
};

// Interaction codes

// Add Book Button
document.addEventListener('DOMContentLoaded', 
    popupController(addBookButton, 
        closeAddBookForm, 
        addBookForm));

bookInputForm.addEventListener('submit', (event) => {
    const inputForm = document.querySelector('#addBookMenu');

    event.preventDefault();
    submitBookButton.disabled = true; // Prevents doubled inputs!
    
    const title = formBookTitle.value,
    author = formBookAuthor.value,
    pages = Number(formBookPages.value),
    readStatus = formBookStatus.value;

    addBookToLibrary(myBooks, title, author, pages, readStatus);
    loadBookIntoShelf(myBooks[myBooks.length - 1])

    inputForm.style.display = 'none';
});

bookshelfContainer.addEventListener('click', (event) => {
    const trashButton = event.target.closest('.trashBook'),
    cancelDelete = document.querySelector('#cancelDelete');
    
    if (trashButton) {
        bookIDToDelete = trashButton.dataset.targetID;
        popupController(trashButton, cancelDelete, confirmWindow);
    }});

confirmWindow.addEventListener('submit', (e) => { 
    e.preventDefault(); 
    
    if (bookIDToDelete) {
        removeBookFromLibrary(myBooks, bookIDToDelete);
        bookIDToDelete = null;
    }

    confirmWindow.style.display = 'none'; 
});

// ==== TEST RUNS ===

updateBookStats(myBooks);

addBookToLibrary(myBooks, "Moby Dick",
    "Herman Melville", 544, false
);

addBookToLibrary(myBooks, "Wuthering Heights",
    "Emily Brontë", 416, true
)

addBookToLibrary(myBooks, "The Odyssey", "Homer",
    140, true
)

addBookToLibrary(myBooks, "The Giving Tree", "Shel Silverstein",
    64, false
)

myBooks.forEach((book) => {
    loadBookIntoShelf(book);
});