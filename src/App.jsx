import React from "react";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Dashboard from "./pages/Dashboard";
import BudgetPage from "./pages/BudgetPage";
import ExpensesPage from "./pages/ExpensesPage";
import Error from "./pages/Error";
import LandingPageApp from "./components/Intro";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary

// Actions
import { logoutAction } from "./actions/logout";
import { deleteBudget } from "./actions/deleteBudget";

// Define router and routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPageApp />, // Landing page for the app
    errorElement: <Error />, // Error fallback page
  },
  {
    path: "/dashboard",
    element: (
      <Authenticator>
        {({ signOut, user }) => {
          return <Dashboard userId={user.userId} signOut={signOut} />;
        }}
      </Authenticator>
    ),
    errorElement: <Error />, // Error fallback page for dashboard
  },
  {
    path: "budget/:id",
    element: (
      <Authenticator>
        <BudgetPage />
      </Authenticator>
    ),
    errorElement: <Error />, // Error fallback page for budget
    children: [
      {
        path: "budget/:id/delete",
        action: deleteBudget, // Delete budget action
      },
    ],
  },
  {
    path: "expenses",
    element: (
      <Authenticator>
        <ExpensesPage />
      </Authenticator>
    ),
    errorElement: <Error />, // Error fallback page for expenses
  },
  {
    path: "logout",
    action: logoutAction, // Logout action
  },
]);

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <RouterProvider router={router} />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
