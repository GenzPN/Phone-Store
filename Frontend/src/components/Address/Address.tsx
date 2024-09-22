import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getToken } from '../../utils/tokenStorage';

interface AddressFormData {
  address: string;
  phone: string;
  is_default: boolean;
}

interface AddressProps {
  userId: number;
}

const Address: React.FC<AddressProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormData>();

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/users/${userId}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/users/${userId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        reset();
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  return (
    <div>
      <h2>Addresses</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="address">Address</label>
          <input
            id="address"
            {...register('address', { required: 'Address is required' })}
          />
          {errors.address && <span>{errors.address.message}</span>}
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            {...register('phone', { required: 'Phone is required' })}
          />
          {errors.phone && <span>{errors.phone.message}</span>}
        </div>
        <div>
          <label htmlFor="is_default">
            <input
              type="checkbox"
              id="is_default"
              {...register('is_default')}
            />
            Set as default address
          </label>
        </div>
        <button type="submit">Add Address</button>
      </form>

      <h3>Existing Addresses</h3>
      <ul>
        {addresses.map((address, index) => (
          <li key={index}>
            {address.address} - {address.phone}
            {address.is_default && ' (Default)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Address;
