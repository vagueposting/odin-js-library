let appState = {
    idToDelete: null,
    idToEdit: null,
    editingBook: false
};

function DataController() {
    const myBooks = [];

    class Book {
    constructor(title, author, pages, readStatus, genre) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
    this.readStatus = Boolean(readStatus);
    this.genre = genre;
    }

    updateInfo(newTitle, newAuthor, newPages, newReadStatus, newGenre) {
        this.title = newTitle;
        this.author = newAuthor;
        this.pages = newPages;
        this.readStatus = newReadStatus;
        this.genre = newGenre;

        updateBookStats();
    }};

    /**
     * Lets you add a book to the library.
     * @param {Array} library - the library array ie., myBooks
     * @param {String} title - book title
     * @param {String} author - book author
     * @param {Number} pages - # of pages
     * @param {Boolean} readStatus - has the book been completed?
     */
    function addBookToLibrary(title, 
        author, pages, 
        readStatus, genre) {
        const newBook = new Book(title, author, pages, readStatus, genre)
        myBooks.push(newBook)
        updateBookStats();

        return `Library size: ${library.length}`;
        }
    
    /**
     * Removes a book from the myBooks array.
     * @param {String} bookID - book id which needs to be deleted
     * @returns if the book exists in the library
     */
    function removeBookFromLibrary(bookID) {
        const index = myBooks.findIndex(book => book.id = bookID);

        if (index !== -1) {
            myBooks.splice(index, 1);
            updateBookStats();
            return true;
        }

        return false;
    }

    function getBooks() {
        return [...myBooks]
    }

    function updateBookStats() {
            const libraryStats = {}

            if (myBooks.length > 0) {
                const totalPages = myBooks.reduce((acc, book) => acc + book.pages, 0); 
                
                libraryStats.totalBooks = myBooks.length;
                libraryStats.totalPages = totalPages;
                
                libraryStats.averagePagesValue = totalPages / myBooks.length;
                
                libraryStats.uniqueAuthorCount = new Set(myBooks.map(item => item.author)).size;
                libraryStats.readBookCount = myBooks.filter(item => item.readStatus).length;
            }
            
            const statsUpdated = new CustomEvent('book-stats-updated', {
                detail: libraryStats
            });

            document.dispatchEvent(statsUpdated);
        }

    // Listens for the "bookAdded" and "bookRemoved" event triggered by the form modal
    document.addEventListener('book-added', (e) => {
        const { title, author, pages, readStatus, genre } = e.detail;
        
        addBookToLibrary(title, author, pages, readStatus, genre)});

    document.addEventListener('book-removed', (e) => {
        const { bookID } = e.detail;

        removeBookFromLibrary(bookID)});

    return { getBooks,
        addBook: addBookToLibrary,
        removeBook: removeBookFromLibrary
     }
}


function DisplayController() {
    const displayObjects = {
        bookshelfContainer: document.querySelector('.bookshelf'),
        bookStats: {
            bookCount: document.querySelector('#bookCount'),
            pageCount: document.querySelector('#pageCount'),
            averagePages: document.querySelector('#averagePages'),
            uniqueAuthors: document.querySelector('#uniqueAuthors')
        },
        bookForm: {
            // Controls
            bookInputForm: document.querySelector('#bookInputForm'),
            addBook: document.querySelector('#addBook'),
            closeBookForm: document.querySelector('#closeAddBookForm'),
            submitBook: document.querySelector('#submitBook'),
            // Actual info fields
            bookInfo: {
                formBookTitle: document.querySelector('#bookTitle'),
                formBookAuthor: document.querySelector('#bookAuthor'),
                formBookPages: document.querySelector('#bookPages'),
                formBookStatus: document.querySelector('#bookStatus'),
            },
        },
        confirmDeleteModal: document.querySelector('#confirmBookDeletion')
    };

    /** 
     * Gets the information of a "book" and modifies its 
     * associated div.
     * 
     * @param {Object} book - the book object found in 
     * the myBooks array
     */

    function createBookInfoElements(book) {
        const fragment = document.createDocumentFragment();

        function addInfoLine(key, value) {
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

                fragment.appendChild(infoKey);
                fragment.appendChild(infoValue);
                fragment.appendChild(lineBreak);
            };
        }

        for (const [key, value] of Object.entries(book)) {
            addInfoLine(key, value)
        };
        

        return fragment;
    }

/** 
 * Inserts an identified book into the user-side library.
 * 
 * @param {Object} book - the book object found in 
 * the myBooks array, which uses class Book
 */

    function loadBookIntoShelf(book) {
        // Init book item div
        const bookItem = document.createElement("div");

        function generateControls() {
            const bookControls = document.createElement('div'),
            deleteButton = document.createElement('button'),
            changeBookInfoButton = document.createElement('button'),
            trash = document.createElement('img'),
            editBook = document.createElement('img');

            bookControls.classList.add('bookControls');
            
            // Delete button
            trash.src = 'img/delete.svg';
            deleteButton.classList.add('trashBook');
            deleteButton.classList.add('bookControlButton');
            deleteButton.dataset.targetID = book.id;

            // Edit button
            editBook.src = 'img/book-edit.svg';
            changeBookInfoButton.classList.add('modifyBook');
            changeBookInfoButton.classList.add('bookControlButton');
            changeBookInfoButton.dataset.targetID = book.id;

            changeBookInfoButton.appendChild(editBook);
            deleteButton.appendChild(trash);

            // Append the final buttons
            bookControls.appendChild(changeBookInfoButton);
            bookControls.appendChild(deleteButton)  

            return bookControls
        }

        function getRandomRotation(min, max) {
        const rotation = Math.random() * (max - min) + min;
        
        return `${rotation.toFixed(1)}deg`;
        }

        // Generate info
        const bookInfoFragment = createBookInfoElements(book)

        // Generate buttons
        const bookControls = generateControls()   

        // Get random rotation for index card        
        const rotationValue = getRandomRotation(-2.5, 2.5)
        
        bookItem.classList.add("bookItem");
        bookItem.style.setProperty('--rand-rot', rotationValue)

        // For editing reference, might remove later when I
        // work out event-based editing.
        bookItem.dataset.id = book.id;

        bookItem.appendChild(bookInfoFragment)
        bookItem.appendChild(bookControls)
        displayObjects.bookshelfContainer.appendChild(bookItem);
    };

    // TODO: change this to an eventListener function for book-stats-updated
    /* function updateBookStats(library) {
         Compute page count 
        if (library.length > 0) {
        const pagesPerBook = library.map(item => item.pages);
        const totalPages = pagesPerBook.reduce((accumulator, currentValue) =>
            accumulator + currentValue);
        const averagePagesValue = totalPages / library.length;
         Compute unique authors 
        const uniqueAuthorSet = new Set(
            library.map(item => item.author));

         Set stat values 
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
    } */

    // TODO: change to event dispatcher
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

    // TODO: I have no idea what this does but I'll also probably turn this 
    // into another event dispatcher
    function grabBookDetails(library, id) {
        // capture book index
        const bookToModify = library.findIndex(book => 
            book.id === id
        )

        // change form details
        formBookTitle.value = myBooks[bookToModify].title;
        formBookAuthor.value = myBooks[bookToModify].author;
        formBookPages.value = Number(myBooks[bookToModify].pages);
        formBookStatus.checked = Boolean(myBooks[bookToModify].readStatus);
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

    function generateRandomPlaceholder() {
        const placeholderOptions = [
            {
                title: 'angry man fights whale',
                author: 'guy from whaling ship'
            },
            {
                title: 'greek man lost at sea',
                author: 'ancient greek anon'
            },
            {
                title: 'sad couple miscommunicates',
                author: 'english girl from writer fam'
            },
            {
                title: 'german boy has awakening',
                author: 'philosopher dude'
            },
            {
                title: 'dad must paint hell',
                author: 'depressed japanese man'
            },
            {
                title: 'smartass makes deal with devil',
                author: 'famous german author'
            }
        ];

        let pick = Math.floor(
            Math.random() * placeholders.length);

        return placeholderOptions[pick]
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
            const placeholders = generateRandomPlaceholder();
            console.log(placeholders)

            formBookTitle.setAttribute('placeholder', placeholders.title)
            formBookAuthor.setAttribute('placeholder', placeholders.author)

            showPopup(addBookForm);
        });
    });

    // The actual book input fom
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
}