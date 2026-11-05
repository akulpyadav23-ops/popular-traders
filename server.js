// GrocerEase Admin & POS - Node.js Express Backend
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'GrocerEase Admin & POS',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'PostgreSQL Connected' : 'Client-Side LocalDB / Fallback Active'
  });
});

// Serve compiled static files if available
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GrocerEase API & POS Server running at http://localhost:${PORT}`);
});
