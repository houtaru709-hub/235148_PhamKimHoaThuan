import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://api-235148.onrender.com';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const [formData, setFormData] = useState({
    bookId: '', title: '', author: '', category: '',
    publisher: '', publishYear: '', isbn: '', quantity: 0, description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Lấy danh sách sách
  const fetchBooks = async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword ? `${API_URL}/api/books?search=${keyword}` : `${API_URL}/api/books`;
      const res = await axios.get(url);
      setBooks(res.data);
      setError('');
    } catch (err) {
      setError('Lỗi khi tải danh sách sách!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  // Thay đổi form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Thêm hoặc Cập nhật sách
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/api/books/${editId}`, formData);
        setSuccess('Cập nhật sách thành công!');
      } else {
        await axios.post(`${API_URL}/api/books`, formData);
        setSuccess('Thêm sách mới thành công!');
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  // Bắt đầu sửa
  const handleEdit = (book) => {
    setIsEditing(true);
    setEditId(book._id);
    setFormData({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher || '',
      publishYear: book.publishYear || '',
      isbn: book.isbn || '',
      quantity: book.quantity || 0,
      description: book.description || ''
    });
  };

  // Xóa sách
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await axios.delete(`${API_URL}/api/books/${id}`);
        setSuccess('Đã xóa sách!');
        fetchBooks();
      } catch (err) {
        setError('Xóa sách thất bại!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bookId: '', title: '', author: '', category: '',
      publisher: '', publishYear: '', isbn: '', quantity: 0, description: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Hệ Thống Quản Lý Sách - 235148 Phạm Kim Hòa Thuận</h2>

      {/* Thông báo status */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Form Tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Tìm theo tên, tác giả, thể loại..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', marginLeft: '10px' }}>Tìm kiếm</button>
      </form>

      {/* Form Thêm/Sửa */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>{isEditing ? 'Cập Nhật Sách' : 'Thêm Sách Mới'}</h3>
        <input name="bookId" placeholder="Mã sách (*)" value={formData.bookId} onChange={handleChange} disabled={isEditing} required />  
        <input name="title" placeholder="Tên sách (*)" value={formData.title} onChange={handleChange} required />  
        <input name="author" placeholder="Tác giả (*)" value={formData.author} onChange={handleChange} required />  
        <input name="category" placeholder="Thể loại (*)" value={formData.category} onChange={handleChange} required /><br/><br/>
        <input name="publisher" placeholder="Nhà xuất bản" value={formData.publisher} onChange={handleChange} />  
        <input name="publishYear" type="number" placeholder="Năm xuất bản" value={formData.publishYear} onChange={handleChange} />  
        <input name="isbn" placeholder="Mã ISBN" value={formData.isbn} onChange={handleChange} />  
        <input name="quantity" type="number" placeholder="Số lượng" value={formData.quantity} onChange={handleChange} /><br/><br/>
        <textarea name="description" placeholder="Mô tả sách" value={formData.description} onChange={handleChange} style={{ width: '80%' }} /><br/><br/>
        <button type="submit">{isEditing ? 'Lưu cập nhật' : 'Thêm mới'}</button>  
        {isEditing && <button type="button" onClick={resetForm}>Hủy</button>}
      </form>

      {/* Danh sách sách */}
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Mã sách</th>
              <th>Tên sách</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Số lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b._id}>
                <td>{b.bookId}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category}</td>
                <td>{b.quantity}</td>
                <td>
                  <button onClick={() => setSelectedBook(b)}>Chi tiết</button>  
                  <button onClick={() => handleEdit(b)}>Sửa</button>  
                  <button onClick={() => handleDelete(b._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Chi tiết sách */}
      {selectedBook && (
        <div style={{ marginTop: '20px', border: '1px solid blue', padding: '10px' }}>
          <h3>Chi tiết: {selectedBook.title}</h3>
          <p><b>NXB:</b> {selectedBook.publisher} | <b>Năm:</b> {selectedBook.publishYear} | <b>ISBN:</b> {selectedBook.isbn}</p>
          <p><b>Mô tả:</b> {selectedBook.description}</p>
          <button onClick={() => setSelectedBook(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
}

export default App;