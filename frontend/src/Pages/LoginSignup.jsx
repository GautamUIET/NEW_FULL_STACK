import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CSS/LoginSignup.css';  // Import the CSS file

export const LoginSignup = () => {

  const navigate = useNavigate();
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",  // Change to username to match backend expectation
    password: "",
    email: ""
  });

  const ChangeHandler = (e) => {
    setFormData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      };
    });
  };

  const login = async () => {
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          'Content-type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log(responseData);

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        toast.success("Login Successful");
        window.location.replace("/");
      } else {
        toast.error(responseData.error || "Login failed, please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed, please try again.");
    }
  };

  const signup = async () => {
    console.log("in Signup page", formData);
    try {
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          Accept: "application/json",
          'Content-type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log(responseData);

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        toast.success("Signup Successful");
        window.location.replace("/");
      } else {
        toast.error(responseData.error || "Signup failed, please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed, please try again.");
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <div className='uper'>
          <h1>{state}</h1>
          <form>
            <div className='loginsignup-fields'>
              {state === "Sign Up" &&
                <input
                  required
                  value={formData.username}  // Change to username
                  onChange={ChangeHandler}
                  type='text'
                  placeholder='Your Name'
                  name='username'  // Change to username
                />
              }
              <input
                required
                value={formData.email}
                onChange={ChangeHandler}
                type='email'
                placeholder='Email Address'
                name='email'
              />
              <input
                required
                value={formData.password}
                onChange={ChangeHandler}
                type='password'
                placeholder='Password'
                name='password'
              />
            </div>
          </form>
          <button onClick={() => { state === "Login" ? login() : signup() }}>
            Continue
          </button>
          <div className='loginsignup-login'>
            {state === "Sign Up" ? 
              <p>Already have an account? <Link to='/login'><span onClick={() => { setState("Login") }}>Login here</span></Link></p>
              :
              <p>Create an account? <Link to='/login'><span onClick={() => { setState("Sign Up") }}>Create Account</span></Link></p>
            }
          </div>
          <div className='loginsignup-agree'>
            <input type='checkbox' id='privacy' />
            <label htmlFor='privacy'>By continuing I agree to the terms of use & privacy policy.</label>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginSignup;
