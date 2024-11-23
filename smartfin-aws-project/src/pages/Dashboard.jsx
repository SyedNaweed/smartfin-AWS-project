import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@aws-amplify/ui-react";
import { toast } from "react-toastify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import AddBudgetForm from "../components/AddBudgetForm";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";
import {
  createBudget,
  createExpense,
  deleteItem,
  fetchData,
  waait,
} from "../helpers";
import useAuth from "../hooks/useAuth";
const apiUrl = `http://13.201.127.231:8000`;

const Dashboard = () => {
  const userId = useAuth(); // Get userId from the useAuth hook
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Fetch budgets and expenses function
  const fetchBudgetsAndExpenses = () => {
    const userBudgets = fetchData("budgets", userId) || [];
    const userExpenses = fetchData("expenses", userId) || [];
    setBudgets(userBudgets);
    setExpenses(userExpenses);
  };

  useEffect(() => {
    fetchBudgetsAndExpenses(); // Fetch when component mounts or userId changes
  }, [userId]); // Fetch when userId changes

  const handleAction = async (actionType, values, userId) => {
    try {
      await waait(); // Simulate delay
      if (!userId) {
        throw new Error("User not authenticated. Please log in.");
      }

      if (actionType === "createBudget") {
        if (!values.newBudget || !values.newBudgetAmount) {
          throw new Error("Invalid budget data");
        }
        const budgetId = await createBudget({
          name: values.newBudget,
          amount: values.newBudgetAmount,
          userId,
        });
        // Create the budget in DynamoDB via FastAPI
      const response = await fetch(`${apiUrl}/create-budget/${budgetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      // const response = await fetch(`http://localhost:8000/create-budget/${budgetId}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
        body: JSON.stringify({
          name: values.newBudget,
          amount: parseFloat(values.newBudgetAmount),
          userId,
        }),
      });

      console.log("Request Body:", {
        name: values.newBudget,
        amount: parseFloat(values.newBudgetAmount),
        userId,
      });
      if (!response.ok) {
        const errorData = await response.json();
  console.log("Response Error:", errorData); 
        throw new Error("Failed to create budget on server");
      }
        toast.success("Budget created!");
        fetchBudgetsAndExpenses(); // Refresh budgets
      }

      if (actionType === "createExpense") {
        if (
          !values.newExpense ||
          !values.newExpenseAmount ||
          !values.newExpenseBudget
        ) {
          throw new Error("Invalid expense data");
        }
        const expenseId = await createExpense({
          name: values.newExpense,
          amount: values.newExpenseAmount,
          budgetId: values.newExpenseBudget,
          userId,
        });
        // Create the expense in DynamoDB via FastAPI
      const response = await fetch(`${apiUrl}/create-expense/${expenseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      // const response = await fetch(`http://localhost:8000/create-expense/${expenseId}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
        body: JSON.stringify({
          name: values.newExpense,
          amount: parseFloat(values.newExpenseAmount),
          budgetId: values.newExpenseBudget,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense on server");
      }
        toast.success(`Expense ${values.newExpense} created!`);
        fetchBudgetsAndExpenses(); // Refresh expenses
      }

      if (actionType === "deleteExpense") {
        if (!values.expenseId) {
          throw new Error("Invalid expense ID");
        }
        // Delete the expense from DynamoDB via FastAPI
      const response = await fetch(
        `${apiUrl}/delete-expense/${userId}/${values.expenseId}`,
        {
          method: "DELETE",
        }
      );
      // const response = await fetch(
      //   `$http://localhost:8000/delete-expense/${userId}/${values.expenseId}`,
      //   {
      //     method: "DELETE",
      //   }
      // );

      if (!response.ok) {
        throw new Error("Failed to delete expense on server");
      }
        toast.success("Expense deleted!");
        setExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.id !== values.expenseId)
        );
        fetchBudgetsAndExpenses(); // Refresh expenses
        window.location.reload(true);
      }
    } catch (e) {
      toast.error(e.message || "There was a problem processing your request.");
      console.error("Error in handleAction:", e);
    }
  };

  const { signOut } = useAuthenticator();
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="dashboard">
      <h1>
        Welcome back, <span className="accent">{user.username}</span>
      </h1>
      <Button onClick={handleSignOut}>Sign Out</Button>
      <div className="grid-sm">
        {budgets && budgets.length > 0 ? (
          <div className="grid-lg">
            <div className="flex-lg">
              <AddBudgetForm
                onAction={(values) =>
                  handleAction("createBudget", values, userId)
                }
              />
              <AddExpenseForm
                budgets={budgets}
                onAction={(values) =>
                  handleAction("createExpense", values, userId)
                }
              />
            </div>
            <h2>Existing Budgets</h2>
            <div className="budgets">
              {budgets.map((budget) => (
                <BudgetItem
                  key={budget.id}
                  budget={budget}
                  onDelete={(expenseId) =>
                    handleAction("deleteExpense", { expenseId }, userId)
                  }
                />
              ))}
            </div>
            {expenses && expenses.length > 0 && (
              <div className="grid-md">
                <h2>Recent Expenses</h2>
                <Table
                  expenses={expenses
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 8)}
                />
                {expenses.length > 8 && (
                  <Link to="expenses" className="btn btn--dark">
                    View all expenses
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid-sm">
            <p>Personal budgeting is the secret to financial freedom.</p>
            <p>Create a budget to get started!</p>
            <AddBudgetForm
              onAction={(values) =>
                handleAction("createBudget", values, userId)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
