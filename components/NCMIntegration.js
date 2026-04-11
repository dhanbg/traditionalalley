import React, { useState, useEffect } from 'react';
import styles from './NCMIntegration.module.css';

const NCMIntegration = ({ order, onNCMOrderCreated }) => {
  const [branches, setBranches] = useState([]);
  const [selectedFromBranch, setSelectedFromBranch] = useState('TINKUNE');
  const [selectedToBranch, setSelectedToBranch] = useState('');
  const [shippingRate, setShippingRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ncmOrderId, setNcmOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  // Load existing NCM order data if available
  useEffect(() => {
    if (order?.ncmOrderId) {
      setNcmOrderId(order.ncmOrderId);
      loadOrderStatus(order.ncmOrderId);
      loadOrderComments(order.ncmOrderId);
    }
  }, [order]);

  const loadBranches = async () => {
    try {
      const response = await fetch('/api/ncm/branches');
      const data = await response.json();
      if (data.success) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const calculateShippingRate = async () => {
    if (!selectedFromBranch || !selectedToBranch) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/ncm/shipping-rate?from=${selectedFromBranch}&to=${selectedToBranch}&type=Pickup`
      );
      const data = await response.json();
      if (data.success) {
        setShippingRate(data.charges);
      }
    } catch (error) {
      console.error('Failed to calculate shipping rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNCMOrder = async () => {
    if (!selectedToBranch || !order) return;

    setLoading(true);
    try {
      const orderData = {
        order: {
          id: order.id,
          total: order.total || order.amount,
          items: order.items || []
        },
        customerInfo: {
          name: order.customerName || `${order.firstName} ${order.lastName}`.trim(),
          phone: order.phone || order.customerPhone,
          alternatePhone: order.alternatePhone || '',
          address: order.address || order.customerAddress
        },
        shippingInfo: {
          fromBranch: selectedFromBranch,
          toBranch: selectedToBranch,
          address: order.shippingAddress || order.address,
          instruction: order.deliveryInstructions || ''
        }
      };

      const response = await fetch('/api/ncm/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      if (data.success) {
        setNcmOrderId(data.ncmOrderId);
        if (onNCMOrderCreated) {
          onNCMOrderCreated(data.ncmOrderId, data.orderData);
        }
        alert(`NCM Order created successfully! Order ID: ${data.ncmOrderId}`);
      } else {
        alert(`Failed to create NCM order: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create NCM order:', error);
      alert('Failed to create NCM order');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStatus = async (orderId) => {
    try {
      const response = await fetch(`/api/ncm/order-status?orderId=${orderId}&type=status`);
      const data = await response.json();
      if (data.success) {
        setOrderStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load order status:', error);
    }
  };

  const loadOrderComments = async (orderId) => {
    try {
      const response = await fetch(`/api/ncm/order-status?orderId=${orderId}&type=comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Failed to load order comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !ncmOrderId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ncm/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: ncmOrderId,
          comment: newComment
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        loadOrderComments(ncmOrderId); // Refresh comments
        alert('Comment added successfully');
      } else {
        alert(`Failed to add comment: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrderData = () => {
    if (ncmOrderId) {
      loadOrderStatus(ncmOrderId);
      loadOrderComments(ncmOrderId);
    }
  };

  return (
    <div className={styles.ncmContainer}>
      <h3>NCM Logistics Integration</h3>
      
      {!ncmOrderId ? (
        <div className={styles.createOrderSection}>
          <h4>Create NCM Delivery Order</h4>
          
          <div className={styles.branchSelection}>
            <div className={styles.formGroup}>
              <label>From Branch:</label>
              <select 
                value={selectedFromBranch} 
                onChange={(e) => setSelectedFromBranch(e.target.value)}
              >
                {branches.map(branch => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>To Branch:</label>
              <select 
                value={selectedToBranch} 
                onChange={(e) => setSelectedToBranch(e.target.value)}
              >
                <option value="">Select destination branch</option>
                {branches.map(branch => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button 
              onClick={calculateShippingRate}
              disabled={!selectedFromBranch || !selectedToBranch || loading}
              className={styles.calculateBtn}
            >
              {loading ? 'Calculating...' : 'Calculate Shipping Rate'}
            </button>

            <button 
              onClick={createNCMOrder}
              disabled={!selectedToBranch || loading}
              className={styles.createBtn}
            >
              {loading ? 'Creating...' : 'Create NCM Order'}
            </button>
          </div>

          {shippingRate && (
            <div className={styles.shippingRate}>
              <h5>Shipping Rate:</h5>
              <p>Rate: Rs. {shippingRate.rate || 'N/A'}</p>
              <p>Delivery Time: {shippingRate.delivery_time || 'N/A'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.orderTrackingSection}>
          <h4>NCM Order Tracking</h4>
          <p><strong>NCM Order ID:</strong> {ncmOrderId}</p>
          
          <button onClick={refreshOrderData} className={styles.refreshBtn}>
            Refresh Status
          </button>

          {orderStatus && (
            <div className={styles.orderStatus}>
              <h5>Order Status History:</h5>
              <div className={styles.statusList}>
                {orderStatus.map((status, index) => (
                  <div key={index} className={styles.statusItem}>
                    <span className={styles.statusText}>{status.status}</span>
                    <span className={styles.statusTime}>
                      {new Date(status.added_time).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.commentsSection}>
            <h5>Order Comments:</h5>
            <div className={styles.commentsList}>
              {comments.map((comment, index) => (
                <div key={index} className={styles.commentItem}>
                  <p>{comment.comments}</p>
                  <small>
                    By: {comment.addedBy} | 
                    {new Date(comment.added_time).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>

            <div className={styles.addComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <button 
                onClick={addComment}
                disabled={!newComment.trim() || loading}
                className={styles.addCommentBtn}
              >
                {loading ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCMIntegration;
