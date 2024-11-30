const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register route
public_users.post("/register", (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if the username already exists
    if (users[username]) {
      return res.status(400).json({ message: "Username already exists." });
    }
  
    // Add the new user to the users object
    users[username] = { password };
  
    // Return success message
    return res.status(201).json({ message: "User registered successfully." });
  });

  const axios = require('axios');

  // Task 10: Get the List of Books Available
  public_users.get('/', async function (req, res) {
    try {
      const response = await axios.get('https://api.example.com/books'); // Replace with your API endpoint
      return res.status(200).json(response.data); // Assuming the response contains a list of books
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books" });
    }
  });

// Task 11: Get Book Details Based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    
    try {
      const response = await axios.get(`https://api.example.com/books/isbn/${isbn}`);
      if (response.data) {
        return res.status(200).json(response.data);  // Return the book details
      } else {
        return res.status(404).json({ message: "Book not found with this ISBN" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book details" });
    }
  });



// Task 12: Get Book Details Based on Author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();
  
  try {
    const response = await axios.get(`https://api.example.com/books/author/${author}`);
    if (response.data.length > 0) {
      return res.status(200).json(response.data); // Return books by author
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

/// Task 13: Get Book Details Based on Title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    
    try {
      const response = await axios.get(`https://api.example.com/books/title/${title}`);
      if (response.data.length > 0) {
        return res.status(200).json(response.data); // Return books by title
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by title" });
    }
  });


  
// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    // Check if the book with the given ISBN exists in the books object
    const book = books[isbn];
  
    if (book) {
      // If the book exists, check if it has reviews
      if (Object.keys(book.reviews).length > 0) {
        return res.status(200).json(book.reviews);  // Return the reviews of the book
      } else {
        return res.status(404).json({ message: "No reviews available for this book" });  // No reviews
      }
    } else {
      return res.status(404).json({ message: "Book not found with this ISBN" });  // Book not found
    }
  });

module.exports.general = public_users;
