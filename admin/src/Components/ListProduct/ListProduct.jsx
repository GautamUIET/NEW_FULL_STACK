import React, { useState, useEffect } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeHandler = async (id) => {
    try {
      const res = await fetch("http://localhost:4000/removeproduct", { // Change https to http
        method: "POST",
        headers: {
          Accept: "application/json",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) {
        await fetchInfo();
      } else {
        console.error("Failed to remove product: ", res.statusText);
      }
    } catch (error) {
      console.error("Error removing product: ", error);
    }
  }

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>New Price</p>
        <p>Old Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproducts-format-main listproduct-format">
              <img src={product.image} alt={product.name} className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>${product.new_price}</p>
              <p>${product.old_price}</p>
              <p>{product.category}</p>
              <img
                src={cross_icon}
                alt="Remove"
                className="litproductremove-icon"
                onClick={() => removeHandler(product.id)}
              />
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
