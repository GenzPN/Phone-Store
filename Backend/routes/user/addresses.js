import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

// Get all addresses (for a user if logged in)
router.get('/', async (req, res) => {
    try {
        const userId = 1; // Thay thế bằng ID người dùng thực tế sau khi xác thực
        const [addresses] = await db.promise().query('SELECT * FROM UserAddresses WHERE user_id = ?', [userId]);
        res.json(addresses);
    } catch (error) {
        console.error('Get user addresses error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new address
router.post('/', async (req, res) => {
    try {
        const userId = 1; // Thay thế bằng ID người dùng thực tế sau khi xác thực
        const { fullName, phone, address } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO UserAddresses (user_id, fullName, phone, address) VALUES (?, ?, ?, ?)',
            [userId, fullName, phone, address]
        );
        res.status(201).json({ id: result.insertId, fullName, phone, address });
    } catch (error) {
        console.error('Add user address error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update an address
router.put('/:id', async (req, res) => {
    try {
        const userId = 1; // Thay thế bằng ID người dùng thực tế sau khi xác thực
        const addressId = req.params.id;
        const { fullName, phone, address } = req.body;
        const [result] = await db.promise().query(
            'UPDATE UserAddresses SET fullName = ?, phone = ?, address = ? WHERE id = ? AND user_id = ?',
            [fullName, phone, address, addressId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found or not owned by user' });
        }
        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update user address error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete an address
router.delete('/:id', async (req, res) => {
    try {
        const userId = 1; // Thay thế bằng ID người dùng thực tế sau khi xác thực
        const addressId = req.params.id;
        const [result] = await db.promise().query(
            'DELETE FROM UserAddresses WHERE id = ? AND user_id = ?',
            [addressId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found or not owned by user' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete user address error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export { router as userAddressRoutes };
