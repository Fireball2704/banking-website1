const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db'); // Adjust the path if necessary

const app = express(); // Initialize the Express app
const PORT = 3000; // Define the port

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define the home page route
app.get('/', (req, res) => {
    res.render('index');
});

// Define the route to view all customers
app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customers', (error, results) => {
        if (error) throw error;
        res.render('customers', { customers: results });
    });
});

// Define the route to view a single customer by ID
app.get('/customer/:id', (req, res) => {
    const customerId = req.params.id;
    pool.query('SELECT * FROM customers WHERE id = ?', [customerId], (error, result) => {
        if (error) throw error;
        res.render('customer', { customer: result[0] });
    });
});

// Define the route to render the money transfer form
app.get('/transfer', (req, res) => {
    pool.query('SELECT * FROM customers', (error, results) => {
        if (error) throw error;
        res.render('transfer', { customers: results });
    });
});

// Define the POST route to handle money transfers
app.post('/transfer', (req, res) => {
    const { fromCustomerId, toCustomerId, amount } = req.body;
    console.log('Transfer Details:', { fromCustomerId, toCustomerId, amount });

    if (fromCustomerId === toCustomerId) {
        return res.send('Cannot transfer money to the same account.');
    }

    pool.query('SELECT * FROM customers WHERE id = ?', [fromCustomerId], (error, fromResult) => {
        if (error) throw error;
        const fromCustomer = fromResult[0];

        if (fromCustomer.balance < amount) {
            return res.send('Insufficient balance');
        }

        pool.query('UPDATE customers SET balance = balance - ? WHERE id = ?', [amount, fromCustomerId], (error) => {
            if (error) throw error;
            pool.query('UPDATE customers SET balance = balance + ? WHERE id = ?', [amount, toCustomerId], (error) => {
                if (error) throw error;
                res.redirect('/viewallcustomers');
            });
        });
    });
});

// Define the route to view all customers after a transfer
app.get('/viewallcustomers', (req, res) => {
    pool.query('SELECT * FROM customers', (error, results) => {
        if (error) throw error;
        res.render('viewallcustomers', { customers: results });
    });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
