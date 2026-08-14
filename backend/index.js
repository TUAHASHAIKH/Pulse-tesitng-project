const express= require('express');
const mongoose= require('mongoose');
const cors= require('cors');
const dotenv= require('dotenv');

const app= express();
const PORT= process.env.PORT || 5000;
dotenv.config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', todoSchema);

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/todos/summary', async (req, res) => {
    try {
        const [total, completed, latestTodo] = await Promise.all([
            Todo.countDocuments(),
            Todo.countDocuments({ completed: true }),
            Todo.findOne().sort({ timestamp: -1 }),
        ]);

        res.json({
            total,
            completed,
            pending: total - completed,
            latestTodo: latestTodo ? latestTodo.title : null,
            latestTimestamp: latestTodo ? latestTodo.timestamp : null,
        });
    } catch (error) {
        console.error('Error fetching todo summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { title } = req.body;
        const newTodo = new Todo({ title });
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(id, { title, completed }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
