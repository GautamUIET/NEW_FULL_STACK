import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import addProductIcon from '../../assets/Product_Cart.svg';
import listProductIcon from '../../assets/Product_list_icon.svg'; // Corrected filename

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/addproduct" style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={addProductIcon} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </Link>

      <Link to="/listproduct" style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="Product List" />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
