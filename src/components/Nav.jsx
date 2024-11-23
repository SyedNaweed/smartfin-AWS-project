import React from "react";
// rrd imports
import { NavLink } from "react-router-dom";

// library
import { TrashIcon } from '@heroicons/react/24/solid';
import {Amplify} from 'aws-amplify'; // Import Amplify
import { useNavigate } from 'react-router-dom';
// assets
import logomark from "../assets/logomark.svg";

const Nav = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Amplify.Auth.signOut(); // Use Amplify to sign out
      navigate('/');  // Redirect to home page or login page
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  return (
    <nav>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Nav;
