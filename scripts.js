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
    this.genre = genre;
    this.readStatus = Boolean(readStatus);
    }

    updateInfo(newTitle, newAuthor, newPages, newGenre, newReadStatus) {
        this.title = newTitle;
        this.author = newAuthor;
        this.pages = newPages;
        this.genre = newGenre;
        this.readStatus = newReadStatus;


        updateBookStats();

        const bookInfoUpdated = new CustomEvent('book-info-updated', {
            detail: this
        });

        document.dispatchEvent(bookInfoUpdated)
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

        const bookAdded = new CustomEvent('book-added', {
            detail: newBook
        });
        document.dispatchEvent(bookAdded);
        }
    
    /**
     * Removes a book from the myBooks array.
     * @param {String} bookID - book id which needs to be deleted
     * @returns if the book exists in the library
     */
    function removeBookFromLibrary(bookID) {
        const index = myBooks.findIndex(book => book.id === bookID);

        if (index !== -1) {
            myBooks.splice(index, 1);
            updateBookStats();
            const bookRemoved = new CustomEvent('book-removed', {
                detail: { bookID: bookID }
            });
            document.dispatchEvent(bookRemoved)
            
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
                libraryStats.totalReadBooks = myBooks.filter(item => item.readStatus).length;
            }
            
            const statsUpdated = new CustomEvent('book-stats-updated', {
                detail: libraryStats
            });

            document.dispatchEvent(statsUpdated);
        }

    return { getBooks,
        addBook: addBookToLibrary,
        removeBook: removeBookFromLibrary
     }
}

function DisplayController(data) {
    const displayObjects = {
        bookshelfContainer: document.querySelector('.bookshelf'),
        bookStats: {
            bookCount: document.querySelector('#bookCount'),
            pageCount: document.querySelector('#pageCount'),
            averagePages: document.querySelector('#averagePages'),
            uniqueAuthors: document.querySelector('#uniqueAuthors'),
            readBookCount: document.querySelector('#readBookCount')
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
                formBookGenre: document.querySelector('#bookGenre'),
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

    function grabBookDetails(id) {
        const library = data.getBooks();
        const bookToModify = library.findIndex(book => book.id === id);
        const { title, author, pages, 
            genre, readStatus } = library[bookToModify];
        const { formBookTitle, formBookAuthor, formBookPages,
            formBookGenre, formBookStatus } = displayObjects.bookForm.bookInfo;

        formBookTitle.value = title;
        formBookAuthor.value = author;
        formBookPages.value = Number(pages);
        formBookGenre.value = genre;
        formBookStatus.checked = Boolean(readStatus);
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

    // Event listeners galore...
    document.addEventListener('book-stats-updated', (e) => {
        const { totalBooks, 
            totalPages, 
            averagePagesValue, 
            uniqueAuthorCount, 
            totalReadBooks } = e.detail;

        const { bookCount, pageCount, averagePages,
            uniqueAuthors, readBookCount } = displayObjects.bookStats

        bookCount.textContent = totalBooks;
        pageCount.textContent = totalPages;
        averagePages.textContent = Math.round(averagePagesValue);
        uniqueAuthors.textContent = uniqueAuthorCount;
        readBookCount.textContent = totalReadBooks;
    });

    document.addEventListener('book-removed', (e) => {
        const { bookID } = e.detail;
        const bookCard = document.querySelector(`[data-id="${bookID}"]`);

        if (bookCard) {
            bookCard.remove();
        }
    })

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

    // The actual book input form
    // TODO: turn this into a pure event dispatcher,
    // then add a listener to DataController()
    // This is a lot of work though so I'm saving it second-to-last
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

    // TODO: dispatch event-book-requested and delete-book-requested  
    bookshelfContainer.addEventListener('click', (event) => {
        const trashButton = event.target.closest('.trashBook');
        const editButton = event.target.closest('.modifyBook');
            
        if (trashButton) {
            const bookToDelete = data.getBooks().find(
                b => b.id === editButtonButton.dataset.targetID);
            showPopup(confirmWindow); 
        }

        if (editButton) {
            const bookToEdit = data.getBooks().find(
                b => b.id === editButton.dataset.targetID
            );
            
            grabBookDetails(bookToEdit);
            
            showPopup(addBookForm);
        }
    });

    confirmWindow.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        
        if (bookToDelete) {
            data.removeBook(bookToDelete)
        }

        confirmWindow.style.display = 'none'; 
    });
}

const data = DataController();
DisplayController(data);