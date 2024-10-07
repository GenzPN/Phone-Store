import express from 'express';
import db from '../../config/database.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);

// Get all addresses (for a user if logged in)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id; // Sử dụng ID người dùng từ token xác thực
        const [addresses] = await db.query('SELECT * FROM UserAddresses WHERE user_id = ?', [userId]);
        res.json(addresses);
    } catch (error) {
        console.error('Get user addresses error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Thêm địa chỉ mới
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { fullName, phone, address, city, isDefault } = req.body;
        const userId = req.user.id;

        await connection.beginTransaction();

        if (isDefault) {
            await connection.query('UPDATE UserAddresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        const [result] = await connection.query(
            'INSERT INTO UserAddresses (user_id, full_name, phone, address, city, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, fullName, phone, address, city, isDefault ? 1 : 0]
        );

        await connection.commit();

        res.status(201).json({ 
            message: 'Địa chỉ đã được thêm thành công', 
            id: result.insertId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Add user address error:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm địa chỉ' });
    } finally {
        connection.release();
    }
});

// Update an address
router.put('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const { fullName, phone, address, city, isDefault } = req.body;

        await connection.beginTransaction();

        if (isDefault) {
            await connection.query('UPDATE UserAddresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        const [result] = await connection.query(
            'UPDATE UserAddresses SET full_name = ?, phone = ?, address = ?, city = ?, is_default = ? WHERE id = ? AND user_id = ?',
            [fullName, phone, address, city, isDefault ? 1 : 0, addressId, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Address not found or not owned by user' });
        }

        await connection.commit();
        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Update user address error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// Delete an address
router.delete('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        await connection.beginTransaction();

        const [result] = await connection.query(
            'DELETE FROM UserAddresses WHERE id = ? AND user_id = ?',
            [addressId, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Address not found or not owned by user' });
        }

        // If the deleted address was the default, set another address as default
        const [defaultAddress] = await connection.query(
            'SELECT id FROM UserAddresses WHERE user_id = ? AND is_default = 1',
            [userId]
        );

        if (defaultAddress.length === 0) {
            const [firstAddress] = await connection.query(
                'SELECT id FROM UserAddresses WHERE user_id = ? LIMIT 1',
                [userId]
            );

            if (firstAddress.length > 0) {
                await connection.query(
                    'UPDATE UserAddresses SET is_default = 1 WHERE id = ?',
                    [firstAddress[0].id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Delete user address error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

export const userAddressRoutes = router;