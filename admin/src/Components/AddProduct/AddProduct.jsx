import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        old_price: "",
        new_price: "",
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { name, old_price, new_price, category } = productDetails;
        return name && old_price && new_price && category && image;
    };

    const Add_Product = async () => {
        if (!validateForm()) {
            alert("Please fill all the fields and select an image.");
            return;
        }

        let formData = new FormData();
        formData.append('products', image);

        try {
            const uploadResponse = await fetch("http://localhost:4000/upload", {
                method: "POST",
                body: formData,
            });

            const responseData = await uploadResponse.json();

            if (responseData.success) {
                const updatedProductDetails = { ...productDetails, image: responseData.image_url };

                const addProductResponse = await fetch('http://localhost:4000/addproduct', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedProductDetails),
                });

                const addProductData = await addProductResponse.json();

                if (addProductData.success) {
                    alert("Product Added");
                    setProductDetails({
                        name: "",
                        image: "",
                        category: "women",
                        old_price: "",
                        new_price: "",
                    });
                    setImage(null);
                } else {
                    alert("Failed to add product");
                }
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding the product.");
        }
    };

    return (
        <div className="add-product">
            <div className="addproduct-field">
                <p>Product title</p>
                <input
                    value={productDetails.name}
                    onChange={changeHandler}
                    type="text"
                    name="name"
                    placeholder="Type here"
                />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input
                        value={productDetails.old_price}
                        onChange={changeHandler}
                        type="text"
                        name="old_price"
                        placeholder="Type here"
                    />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input
                        value={productDetails.new_price}
                        onChange={changeHandler}
                        type="text"
                        name="new_price"
                        placeholder="Type here"
                    />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select
                    value={productDetails.category}
                    onChange={changeHandler}
                    name="category"
                    className="add-product-selector"
                >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img
                        src={image ? URL.createObjectURL(image) : upload_area}
                        alt="Upload Area"
                        className="addproduct-thumbnail-img"
                    />
                </label>
                <input
                    onChange={imageHandler}
                    type="file"
                    name="image"
                    id="file-input"
                    hidden
                />
            </div>
            <button onClick={Add_Product} className="addproduct-btn">
                ADD
            </button>
        </div>
    );
};

export default AddProduct;
