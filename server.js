const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the root URL to serve main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`- Flights: http://localhost:${PORT}/main.html`);
    console.log(`- Hotels:  http://localhost:${PORT}/hotels.html`);
    console.log(`- Orders:  http://localhost:${PORT}/orders.html`);
});
