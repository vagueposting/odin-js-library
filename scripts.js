// 2025-11-19 13:50 GMT +8
// Completed application refactor
// TODO: Add "sort" feature to DisplayController()

let appState = {
    idToDelete: null,
    idToEdit: null,
    editingBook: false
};

function DataController() {
    const myBooks = [];

    class Book {
    constructor({ title, author, pages, 
        readStatus, genre }) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.id = crypto.randomUUID();
    this.genre = genre;
    this.readStatus = Boolean(readStatus);
    }

    updateInfo({ title, author, 
        pages, genre, readStatus }) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.genre = genre;
        this.readStatus = readStatus;


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
    function addBookToLibrary({ title, 
        author, pages, 
        readStatus, genre }) {
        const newBook = new Book({title, author, pages, readStatus, genre})
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

    /**
     * Creates a new array by sorting through the original myBooks array
     * @param {string} criteria - The book property to sort with
     * @param {string} direction - 'asc' for ascending, 'desc' for descending 
     * @returns {Array} The sorted myBooks array
     */
    function sortBooks(criteria, direction = 'asc') {
        const sortedBooks = getBooks();

        sortedBooks.sort((a,b) => {
            let aValue = a[criteria];
            let bValue = b[criteria];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        })

        const booksSorted = new CustomEvent('books-sorted', {
            detail: sortedBooks
        });
        document.dispatchEvent(booksSorted)

        return sortedBooks;
    }

    return { getBooks,
        addBook: addBookToLibrary,
        removeBook: removeBookFromLibrary,
        sortBooks
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
        sortBooks: {
            sortBook: document.querySelector('#sortBooks'),
            sortBookMenu: document.querySelector('#sortBookMenu'),
            sortCriteria: document.querySelector('#sortCriteria'),
            closeSortForm: document.querySelector('#closeSortForm'),
            submitSort: document.querySelector('#submitSort')
        },
        bookForm: {
            // Controls
            addBookMenu: document.querySelector('#addBookMenu'),
            // the true form
            inputForm: document.querySelector('#bookInputForm'),
            // button
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
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('bookInfoContent');

        function addInfoLine(key, value) {
            if (key != 'id' && value !== null && value !== undefined) {
                const infoPiece = document.createElement("span")
                const infoKey = document.createElement("span");
                const infoValue = document.createElement("span");
                const lineBreak = document.createElement("br");

                infoPiece.classList.add('infoPiece');

                let displayKey = "";
                
                infoKey.classList.add("bookInfoHeader");
                
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
                        infoValue.classList.add('valueReadTrue');
                        infoValue.textContent = '✔';
                    } else {
                        infoKey.classList.add('keyReadFalse');
                        infoValue.classList.add('valueReadFalse');
                        infoValue.textContent = '✘';
                    }
                } else {
                    infoKey.textContent = `${displayKey}: `;
                    infoValue.textContent = `${value}`;
                }

                infoPiece.appendChild(infoKey);
                infoPiece.appendChild(infoValue);

                infoContainer.appendChild(infoPiece);
                infoContainer.appendChild(lineBreak);
            };
        }

        for (const [key, value] of Object.entries(book)) {
            addInfoLine(key, value)
        };
        

        return infoContainer;
    }

    /** 
     * Inserts an identified book into the user-side library.
     * 
     * @param {Object} book - object of class Book
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
        const bookToModify = library.find(book => book.id === id);

        if (!bookToModify) return;

        const { title, author, pages, genre, readStatus } = bookToModify;
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
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            divPopup.classList.remove('visible');
        });

        // 2. Outside-click listener
        window.addEventListener('click', (event) => {
            if (event.target === divPopup) {
                divPopup.classList.remove('visible');
            }
        });
    }

    function showPopup(divPopup) {
        divPopup.classList.add('visible');
    }

    function modifyBookItemInfo(updatedBook) {
        const bookCard = document.querySelector(`[data-id="${updatedBook.id}"]`);
        if (!bookCard) return;

        const oldInfoContainer = bookCard.querySelector('.bookInfoContent');
        const originalControls = bookCard.querySelector('.bookControls');
        const newInfoContainer = createBookInfoElements(updatedBook);

        if (oldInfoContainer) {
            bookCard.replaceChild(newInfoContainer, oldInfoContainer);
        } else {
            bookCard.insertBefore(newInfoContainer, originalControls);
        }
    }

    function renderBookshelf(library) {
        displayObjects.bookshelfContainer.innerHTML = '';

        library.forEach(book => loadBookIntoShelf(book));
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
            Math.random() * placeholderOptions.length);

        return placeholderOptions[pick]
    }

    // Event listeners galore...
    document.addEventListener('book-added', (e) => {
        loadBookIntoShelf(e.detail);
    });

    document.addEventListener('book-info-updated', (e) => {
        modifyBookItemInfo(e.detail);
    });
    
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

            const { addBookMenu,
                closeBookForm, addBook } = displayObjects.bookForm;

            const confirmWindow = displayObjects.confirmDeleteModal,
            cancelDelete = document.getElementById('cancelDelete');

            const { sortBookMenu, sortBook,
                closeSortForm
            } = displayObjects.sortBooks;

            setupPopupCloseListeners(addBookMenu, closeBookForm);
            setupPopupCloseListeners(confirmWindow, cancelDelete);
            setupPopupCloseListeners(sortBookMenu, closeSortForm);

        addBook.addEventListener('click', () => {
            const { formBookTitle, formBookAuthor } = displayObjects.bookForm.bookInfo;
            const placeholders = generateRandomPlaceholder();
            
            formBookTitle.setAttribute('placeholder', placeholders.title)
            formBookAuthor.setAttribute('placeholder', placeholders.author)

            showPopup(addBookMenu);
        });

        sortBook.addEventListener('click', () => {
            showPopup(sortBookMenu);
        });
    });

    displayObjects.bookForm.addBookMenu.addEventListener('submit', (event) => {
        event.preventDefault();

        displayObjects.bookForm.submitBook.disabled = true;

        const { formBookTitle, formBookAuthor,
            formBookPages, formBookGenre,
            formBookStatus
        } = displayObjects.bookForm.bookInfo;
        
        const newBookData = {
            title: formBookTitle.value,
            author: formBookAuthor.value,
            pages: Number(formBookPages.value),
            genre: formBookGenre.value,
            readStatus: formBookStatus.checked
        };
        
        if (appState.editingBook) {
            const library = data.getBooks();
            const bookToUpdate = library.find(
                book => book.id === appState.idToEdit);

            bookToUpdate.updateInfo(newBookData);

            appState.editingBook = false;
            appState.idToEdit = null;

            displayObjects.bookForm.addBookMenu.classList.remove('visible')
            return;
        }
        
        
        data.addBook(newBookData);
        
        displayObjects.bookForm.submitBook.disabled = false;

        displayObjects.bookForm.addBookMenu.classList.remove('visible');
        displayObjects.bookForm.inputForm.reset();
    });

    displayObjects.bookshelfContainer.addEventListener('click', (event) => {
        const trashButton = event.target.closest('.trashBook');
        const editButton = event.target.closest('.modifyBook');
            
        if (trashButton) {
            appState.idToDelete = trashButton.dataset.targetID;
            showPopup(displayObjects.confirmDeleteModal); 
        }

        if (editButton) {
            appState.idToEdit = editButton.dataset.targetID;
            appState.editingBook = true;

            const bookToEdit = data.getBooks().find(
                b => b.id === editButton.dataset.targetID
            );
            
            grabBookDetails(appState.idToEdit);
            
            showPopup(displayObjects.bookForm.addBookMenu);
        }
    });

    document.addEventListener('books-sorted', (e) => {
        renderBookshelf(e.detail)
    });

    displayObjects.sortBooks.sortBookMenu.addEventListener('submit', (e) => {
        e.preventDefault();

        const { sortCriteria } = displayObjects.sortBooks;
        
        // Assuming you add a sortDirection input and get it here:
        // const sortDirection = document.querySelector('#sortDirection'); // <-- You need to define and select this in displayObjects

        data.sortBooks(sortCriteria.value, 'asc'); 
        
        displayObjects.sortBooks.sortBookMenu.classList.remove('visible');
    })

    displayObjects.confirmDeleteModal.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        
        if (appState.idToDelete) {
            data.removeBook(appState.idToDelete);
        }

        displayObjects.confirmDeleteModal.classList.remove('visible'); 
    });

    return {displayObjects}
}

const data = DataController();
DisplayController(data);

// ASSUMPTION: 'data' (the DataController return object) is accessible here.
// Example: const data = DataController(); 

// --- Test Library Books: Directly using data.addBook() ---

// 1. Science Fiction (Read)
data.addBook({
    title: "Dune", 
    author: "Frank Herbert", 
    pages: 412, 
    readStatus: true, 
    genre: "Science Fiction"
});

// 2. Fantasy (Unread)
data.addBook({
    title: "Mistborn: The Final Empire", 
    author: "Brandon Sanderson", 
    pages: 671, 
    readStatus: false, 
    genre: "Fantasy"
});

// 3. Classic Literature (Read)
data.addBook({
    title: "Pride and Prejudice", 
    author: "Jane Austen", 
    pages: 279, 
    readStatus: true, 
    genre: "Classic"
});

// 4. Non-Fiction / Self-Help (Read)
data.addBook({
    title: "Atomic Habits", 
    author: "James Clear", 
    pages: 320, 
    readStatus: true, 
    genre: "Non-Fiction"
});

// 5. Thriller (Unread)
data.addBook({
    title: "The Silent Patient", 
    author: "Alex Michaelides", 
    pages: 336, 
    readStatus: false, 
    genre: "Thriller"
});

// 6. Young Adult / Fantasy (Read)
data.addBook({
    title: "Harry Potter and the Sorcerer's Stone", 
    author: "J.K. Rowling", 
    pages: 309, 
    readStatus: true, 
    genre: "Young Adult"
});

// 7. Graphic Novel / Comics (Unread)
data.addBook({
    title: "Watchmen", 
    author: "Alan Moore", 
    pages: 416, 
    readStatus: false, 
    genre: "Graphic Novel"
});

// 8. Epic Fantasy (Longest book, Read)
data.addBook({
    title: "The Way of Kings", 
    author: "Brandon Sanderson", 
    pages: 1007, 
    readStatus: true, 
    genre: "Fantasy"
});

console.log(`Test library populated with ${data.getBooks().length} books.`);