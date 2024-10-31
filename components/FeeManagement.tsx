import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const FeeManagement = () => {
  const [currentFee, setCurrentFee] = useState(0);
  const [newFee, setNewFee] = useState('');

  useEffect(() => {
    fetchCurrentFee();
  }, []);

  const fetchCurrentFee = async () => {
    try {
      const response = await fetch('/api/admin/fee-config');
      const data = await response.json();
      setCurrentFee(data.feeRate * 100); // Convert to percentage
    } catch (error) {
      console.error('Failed to fetch current fee:', error);
      toast.error('Failed to load current fee');
    }
  };

  const handleUpdateFee = async () => {
    const feeRate = parseFloat(newFee) / 100; // Convert percentage to decimal
    if (isNaN(feeRate) || feeRate < 0 || feeRate > 1) {
      toast.error('Please enter a valid percentage between 0 and 100');
      return;
    }

    try {
      const response = await fetch('/api/admin/fee-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeRate }),
      });

      if (response.ok) {
        toast.success('Fee updated successfully');
        setCurrentFee(parseFloat(newFee));
        setNewFee('');
      } else {
        toast.error('Failed to update fee');
      }
    } catch (error) {
      console.error('Error updating fee:', error);
      toast.error('An error occurred while updating the fee');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Current Fee: {currentFee.toFixed(2)}%</p>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            placeholder="New fee percentage"
            min="0"
            max="100"
            step="0.01"
          />
          <Button onClick={handleUpdateFee}>Update Fee</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeManagement;