let myBooks = [];

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
    const container = document.querySelector("body") // TODO: change to final assignment
    const bookItem = document.createElement("div");
    bookItem.classList.add("bookItem");

    for (const [key, value] of Object.entries(book)) {
        if (key != 'id' && value !== null && value !== undefined) {
            const infoKey = document.createElement("span");
            const infoValue = document.createElement("span");
            const lineBreak = document.createElement("br");
            
            const displayKey = key
                .replace(/([A-Z])/g, ' $1') // Adds a space before capital letters
                .replace(/^./, str => str.toUpperCase()); // Capitalizes the first letter
            
            infoKey.textContent = `${displayKey}: `;
            infoValue.textContent = `${value}`;

            bookItem.appendChild(infoKey);
            bookItem.appendChild(infoValue);
            bookItem.appendChild(lineBreak);
        } else if (key === 'id') {
            bookItem.dataset[key] = value;
        }
    }

    // TODO: refactor the ID assignment

    container.appendChild(bookItem);
};

addBookToLibrary("Moby Dick",
    "Herman Melville", 544, false
);

addBookToLibrary("Wuthering Heights",
    "Emily Brontë", 416, true
)

myBooks.forEach((book) => {
    loadBookIntoShelf(book);
});