import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };  // If an error is caught, show fallback UI
  }

  componentDidCatch(error, info) {
    // You can log the error to an error tracking service here
    console.error('Error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Redirect to Dashboard if an error occurs
      return <RedirectToDashboard />;
    }
    return this.props.children;
  }
}

// The RedirectToDashboard component
const RedirectToDashboard = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    // Redirect to the Dashboard page
    navigate('/dashboard');
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default ErrorBoundary;
