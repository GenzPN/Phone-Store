const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Get all addresses (for a user if logged in)
router.get('/', async (req, res) => {
    try {
        let query = 'SELECT * FROM UserAddresses';
        const params = [];
        
        if (req.user && req.user.id) {
            query += ' WHERE user_id = ?';
            params.push(req.user.id);
        } else {
            query += ' WHERE user_id IS NULL';
        }
        
        const [addresses] = await db.query(query, params);
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses', error: error.message });
    }
});

// Create a new address
router.post('/', async (req, res) => {
    try {
        const { fullName, phone, address, is_default, address_type, company_name } = req.body;
        const userId = req.user ? req.user.id : null;

        const [result] = await db.query(
            'INSERT INTO UserAddresses (user_id, fullName, phone, address, is_default, address_type, company_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, fullName, phone, address, is_default, address_type, company_name]
        );

        res.status(201).json({ id: result.insertId, message: 'Address created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating address', error: error.message });
    }
});

// Update an address
router.put('/:id', async (req, res) => {
    try {
        const { fullName, phone, address, is_default, address_type, company_name } = req.body;
        const addressId = req.params.id;
        const userId = req.user ? req.user.id : null;

        let query = 'UPDATE UserAddresses SET fullName = ?, phone = ?, address = ?, is_default = ?, address_type = ?, company_name = ? WHERE id = ?';
        const params = [fullName, phone, address, is_default, address_type, company_name, addressId];

        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        } else {
            query += ' AND user_id IS NULL';
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found or you do not have permission to update it' });
        }

        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating address', error: error.message });
    }
});

// Delete an address
router.delete('/:id', async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.user ? req.user.id : null;

        let query = 'DELETE FROM UserAddresses WHERE id = ?';
        const params = [addressId];

        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        } else {
            query += ' AND user_id IS NULL';
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found or you do not have permission to delete it' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address', error: error.message });
    }
});

const userAddressRoutes = router;
module.exports = userAddressRoutes;
