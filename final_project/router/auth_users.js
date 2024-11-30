const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username is a valid string and not empty
    if (typeof username === 'string' && username.trim().length > 0) {
      return true; // valid username
    }
    return false; // invalid username
  }

  const authenticatedUser = (username, password) => {
    // Check if the username exists in the records
    const user = users.find(user => user.username === username);
    
    // If the user is found, check if the password matches
    if (user && user.password === password) {
      return true; // valid user
    }
    return false; // invalid username or password
  }

// Login endpoint for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body; // Getting username and password from the body
  
    // Step 1: Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Step 2: Check if the user exists in the database (users object)
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  
    // Step 3: Validate the password (here we assume password is stored in plain text, which should not be the case in production)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }
  
    // Step 4: Create a JWT token (set the payload with the username)
    const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Set expiration time for 1 hour
  
    // Step 5: Send the JWT as response to the client
    return res.status(200).json({
      message: "Login successful.",
      token: token, // Send back the token to the client
    });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Get the ISBN from the request parameters
    const { review } = req.query; // Get the review from the query parameters
    const { username } = req.session; // Get the username from the session (ensures the user is logged in)
  
    // Step 1: Check if the user is logged in (username should exist in session)
    if (!username) {
      return res.status(401).json({ message: "You must be logged in to post a review." });
    }
  
    // Step 2: Check if the review is provided in the query parameters
    if (!review) {
      return res.status(400).json({ message: "Review content is required." });
    }
  
    // Step 3: Check if the book exists using the ISBN
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Step 4: If the user has already posted a review for the book, modify it
    if (book.reviews && book.reviews[username]) {
      book.reviews[username] = review; // Modify the existing review
      return res.status(200).json({
        message: "Review updated successfully.",
        book: book,
      });
    }
  
    // Step 5: If the user has not posted a review yet, add a new one
    if (!book.reviews) {
      book.reviews = {};
    }
    book.reviews[username] = review; // Add a new review
  
    return res.status(201).json({
      message: "Review added successfully.",
      book: book,
    });
  });

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const username = decoded.username;
        const { isbn } = req.params;

        if (!books[isbn]) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: 'Review not found' });
        }

        delete books[isbn].reviews[username];

        return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
