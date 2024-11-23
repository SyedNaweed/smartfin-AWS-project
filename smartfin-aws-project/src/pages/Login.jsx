import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // If the user is authenticated, redirect to the home page
      toast.success("Successfully logged in!");
      navigate("/"); // Redirect to the home page after successful login
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    toast.success("Successfully logged in!");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading until authentication state is checked
  }

  return (
    <Authenticator
      signUpConfig={{
        hiddenDefaults: ["email"], // Optional: Customize sign-up config
      }}
      onStateChange={(state) => {
        if (state === "signedIn") {
          handleLoginSuccess();
        }
      }}
    >
      <div>Loading...</div> {/* Show loading while the Authenticator component is loading */}
    </Authenticator>
  );
};

export default Login;
