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
    submitBookButton = document.querySelector('#submitBook'),
    // Confirm to delete books
    confirmWindow = document.querySelector('#confirmBookDeletion');

let appState = {
    idToDelete: null,
    idToEdit: null,
    editingBook: false
};

class Book {
    constructor(title, author, pages, readStatus) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
    this.readStatus = Boolean(readStatus);
}};

/**
 * Lets you add a book to the library.
 * @param {Array} library - the library array ie., myBooks
 * @param {String} title - book title
 * @param {String} author - book author
 * @param {Number} pages - # of pages
 * @param {Boolean} readStatus - has the book been completed?
 */

function addBookToLibrary(library, title, author, 
    pages, readStatus) {
    library.push(new Book(title, author, pages, readStatus))
};

function updateBookInLibrary(library, id, newTitle, newAuthor,
    newPages, newReadStatus) {
    const t = library.findIndex(book => book.id === id)

    library[t].title = newTitle;
    library[t].author = newAuthor;
    library[t].pages = newPages;
    library[t].readStatus = newReadStatus;
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
    changeBookInfoButton.dataset.targetID = book.id;

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
    const bookControls = bookItem.querySelector('.bookControls');

    bookItem.innerHTML = ''; 

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
                    infoKey.classList.add('keyReadTrue');
                    infoValue.classList.add('valueReadTrue')
                    infoValue.textContent = '✔';
                } else {
                    infoKey.classList.add('keyReadFalse');
                    infoValue.classList.add('valueReadFalse')
                    infoValue.textContent = '✘';
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
    
    if (bookControls) {
        bookItem.appendChild(bookControls);
    }

    return bookItem;
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
    //   book w/ ID in library and get its index
    const bookToRemove = library.findIndex(book => 
        book.id === id
    );
    // Remove the book from the visible library
    const bookCard = document.querySelector(`[data-id="${id}"]`)
    if (bookCard) {
        bookCard.remove()
    }
    library.splice(bookToRemove, 1);
    updateBookStats(library);
}

function grabBookDetails(library, id) {
    // capture book index
    const bookToModify = library.findIndex(book => 
        book.id === id
    )

    // change form details
    formBookTitle.value = myBooks[bookToModify].title;
    formBookAuthor.value = myBooks[bookToModify].author;
    formBookPages.value = Number(myBooks[bookToModify].pages);
    formBookStatus.value = Boolean(myBooks[bookToModify].readStatus);
}

/**
 * Sets up listeners to close the popup via its close 
 * button or an outside click.
 * @param {HTMLElement} divPopup - The main popup 
 * container element.
 * @param {HTMLElement} closeButton - The button that 
 * triggers the close action.
 */
function setupPopupCloseListeners(divPopup, closeButton) {
    // Close button listener
    closeButton.addEventListener('click', () => {
        divPopup.style.display = 'none';
    });

    // 2. Outside-click listener
    window.addEventListener('click', (event) => {
        if (event.target === divPopup) {
            divPopup.style.display = 'none';
        }
    });
}

/**
 * Displays the target popup element.
 * @param {HTMLElement} divPopup - The main popup 
 * container element.
 */
function showPopup(divPopup) {
    divPopup.style.display = 'block';
}

// Interaction codes

document.addEventListener('DOMContentLoaded', () => {
    setupPopupCloseListeners(addBookForm, closeAddBookForm);

    const cancelDelete = document.querySelector('#cancelDelete');
    setupPopupCloseListeners(confirmWindow, cancelDelete);

    addBookButton.addEventListener('click', () => {
        showPopup(addBookForm);
    });
});

// The actual book input form
// The actual book input form
bookInputForm.addEventListener('submit', (event) => {
    const inputForm = document.querySelector('#addBookMenu');

    event.preventDefault();
    submitBookButton.disabled = true;
    
    const title = formBookTitle.value,
    author = formBookAuthor.value,
    pages = Number(formBookPages.value),
    readStatus = formBookStatus.checked;

    if (appState.editingBook) {
        
        updateBookInLibrary(myBooks, appState.idToEdit,
            title, author, pages, readStatus
        );

        const bookIndex = myBooks.findIndex(book => book.id === appState.idToEdit);
        const updatedBook = myBooks[bookIndex];

        const existingBookItem = document.querySelector(`[data-id="${appState.idToEdit}"]`);

        if (existingBookItem && updatedBook) {
            modifyBookItemInfo(existingBookItem, updatedBook);
        }
        
        appState.editingBook = false;
        appState.idToEdit = null;

        updateBookStats(myBooks);

    } else {
        addBookToLibrary(myBooks, title, author,
            pages, readStatus);
            
        loadBookIntoShelf(myBooks[myBooks.length - 1])
    }
    
    submitBookButton.disabled = false;
    inputForm.style.display = 'none';

    bookInputForm.reset();
});

bookshelfContainer.addEventListener('click', (event) => {
    const trashButton = event.target.closest('.trashBook');
    const editButton = event.target.closest('.modifyBook');
        
    if (trashButton) {
        appState.idToDelete = trashButton.dataset.targetID;
        showPopup(confirmWindow); 
    }

    if (editButton) {
        appState.idToEdit = editButton.dataset.targetID;
        appState.editingBook = true;
        
        grabBookDetails(myBooks, appState.idToEdit);
        
        showPopup(addBookForm);
    }
});

confirmWindow.addEventListener('submit', (e) => { 
    e.preventDefault(); 
    
    if (appState.idToDelete) {
        removeBookFromLibrary(myBooks, appState.idToDelete);
        appState.idToDelete = null;
    }

    confirmWindow.style.display = 'none'; 
});