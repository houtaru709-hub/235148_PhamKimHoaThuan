global.crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Book = require('./models/Book');

const app = express();
app.use(cors({
  origin: '*', // Cho phép mọi Frontend (hoặc điền link Render Frontend của bạn vào đây)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB Atlas thành công!'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Endpoint kiểm tra sức khỏe hệ thống (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend đang hoạt động tốt!' });
});

// 1. GET /api/books (Lấy danh sách sách & Tìm kiếm theo từ khóa)
app.get('/api/books', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const books = await Book.find(query);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// 2. GET /api/books/:id (Xem chi tiết một sách)
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Không tìm thấy sách!' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Dữ liệu ID không hợp lệ', error: error.message });
  }
});

// 3. POST /api/books (Thêm sách mới)
app.post('/api/books', async (req, res) => {
  try {
    const { bookId, title, author, category } = req.body;
    
    // Kiểm tra dữ liệu bắt buộc
    if (!bookId || !title || !author || !category) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
    }

    // Kiểm tra trùng mã sách bookId
    const existingBook = await Book.findOne({ bookId });
    if (existingBook) {
      return res.status(400).json({ message: 'Mã sách (bookId) đã tồn tại!' });
    }

    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Không thể thêm sách mới', error: error.message });
  }
});

// 4. PUT /api/books/:id (Cập nhật thông tin sách)
app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedBook) return res.status(404).json({ message: 'Không tìm thấy sách để cập nhật!' });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
});

// 5. DELETE /api/books/:id (Xóa sách)
app.delete('/api/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Không tìm thấy sách để xóa!' });
    res.status(200).json({ message: 'Đã xóa sách thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sách', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Backend đang chạy tại port ${PORT}`);
});