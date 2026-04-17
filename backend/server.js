const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'todo_db',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection and create table
const initializeDatabase = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Create todos table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Todos table ready');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Initialize database on startup
initializeDatabase();

// ============ API ROUTES ============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch todos' 
    });
  }
});

// Get single todo by id
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Todo not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch todo' 
    });
  }
});

// Create new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), description || '']
    );
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create todo' 
    });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    // Check if todo exists
    const checkResult = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Todo not found' 
      });
    }
    
    const result = await pool.query(
      `UPDATE todos 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           completed = COALESCE($3, completed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [title, description, completed, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update todo' 
    });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Todo not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete todo' 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      todos: '/api/todos',
      singleTodo: '/api/todos/:id'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
