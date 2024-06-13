import React from 'react';

const CustomToast = ({ message, icon }) => (
  <div>
    <span className="toast-icon">{icon}</span>
    <span>{message}</span>
  </div>
);

export default CustomToast;
