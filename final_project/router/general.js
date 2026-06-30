const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ username, password });
            return res.status(200).json({
                message: "User successfully registered. Now you can login"
            });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user. Please provide username and password." });
});

// ─── Task 2: Get all books ─────────────────────────────────────────────────
// Async/Await implementation
public_users.get('/', async function (req, res) {
    try {
        const getAllBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Books not found"));
                }
            });
        };
        const data = await getAllBooks();
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── Task 3: Get book by ISBN ──────────────────────────────────────────────
// Promise implementation
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error(`No book found with ISBN ${isbn}`));
        }
    })
    .then((book) => res.send(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// ─── Task 4: Get books by author ───────────────────────────────────────────
// Promise implementation
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    new Promise((resolve, reject) => {
        let booksByAuthor = {};
        for (let key in books) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                booksByAuthor[key] = books[key];
            }
        }
        if (Object.keys(booksByAuthor).length > 0) {
            resolve(booksByAuthor);
        } else {
            reject(new Error(`No books found for author: ${author}`));
        }
    })
    .then((data) => res.send(data))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// ─── Task 5: Get books by title ────────────────────────────────────────────
// Promise implementation
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    new Promise((resolve, reject) => {
        let booksByTitle = {};
        for (let key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                booksByTitle[key] = books[key];
            }
        }
        if (Object.keys(booksByTitle).length > 0) {
            resolve(booksByTitle);
        } else {
            reject(new Error(`No books found with title: ${title}`));
        }
    })
    .then((data) => res.send(data))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// ─── Task 6: Get book reviews ──────────────────────────────────────────────
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(books[isbn].reviews);
    } else {
        res.status(404).json({ message: `No book found with ISBN ${isbn}` });
    }
});

// ─── Async/Await with Axios — 4 methods for Task 11 ───────────────────────

// Method 1: Get all books using async/await with Axios
const getAllBooksAsync = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        console.log("\n📚 [Async/Await] All Books:");
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Error fetching all books:", error.message);
        throw error;
    }
};

// Method 2: Get book by ISBN using Promise + Axios
const getBookByISBNPromise = (isbn) => {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => {
            console.log(`\n📖 [Promise] Book with ISBN ${isbn}:`);
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        })
        .catch((error) => {
            console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
            throw error;
        });
};

// Method 3: Get books by author using Promise + Axios
const getBooksByAuthorPromise = (author) => {
    return axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
        .then((response) => {
            console.log(`\n✍️  [Promise] Books by author "${author}":`);
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        })
        .catch((error) => {
            console.error(`Error fetching books by author ${author}:`, error.message);
            throw error;
        });
};

// Method 4: Get books by title using Promise + Axios
const getBooksByTitlePromise = (title) => {
    return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then((response) => {
            console.log(`\n🔍 [Promise] Books with title "${title}":`);
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        })
        .catch((error) => {
            console.error(`Error fetching books with title ${title}:`, error.message);
            throw error;
        });
};

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNPromise = getBookByISBNPromise;
module.exports.getBooksByAuthorPromise = getBooksByAuthorPromise;
module.exports.getBooksByTitlePromise = getBooksByTitlePromise;

// ─── Demonstration: actually invoke the 4 methods ─────────────────────────
// Run this file directly with `node general.js` (with the server already
// running on port 5000) to see all 4 Axios methods execute end-to-end.
if (require.main === module) {
    (async () => {
        console.log("=".repeat(60));
        console.log("DEMO: Executing the 4 CRUD methods with Axios");
        console.log("=".repeat(60));

        // Method 1: async/await
        await getAllBooksAsync();

        // Method 2: Promise
        await getBookByISBNPromise(1);

        // Method 3: Promise
        await getBooksByAuthorPromise("Jane Austen");

        // Method 4: Promise
        await getBooksByTitlePromise("Things Fall Apart");

        console.log("\n" + "=".repeat(60));
        console.log("DEMO COMPLETE — all 4 methods executed successfully");
        console.log("=".repeat(60));
    })();
}
