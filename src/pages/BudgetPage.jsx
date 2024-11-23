import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";
import { createExpense, deleteItem, getAllMatchingItems } from "../helpers";
import useAuth from "../hooks/useAuth";
import { useParams } from "react-router-dom";
import { deleteBudget } from "../actions/deleteBudget";
const apiUrl = `http://13.201.127.231:8000`;

const BudgetPage = () => {
  const { id } = useParams();
  const userId = useAuth(); // Get the userId from the auth hook
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchBudgetAndExpenses = async () => {
      const fetchedBudget = await getAllMatchingItems({
        category: "budgets",
        key: "id",
        value: id,
        userId,
      });

      const fetchedExpenses = await getAllMatchingItems({
        category: "expenses",
        key: "budgetId",
        value: id,
        userId,
      });

      if (fetchedBudget.length > 0) {
        setBudget(fetchedBudget[0]);
      } else {
        toast.error("The budget you’re trying to find doesn’t exist");
      }

      setExpenses(fetchedExpenses);
    };

    fetchBudgetAndExpenses();
  }, [id, userId]);

  const handleCreateExpense = async (values) => {
    try {
      const expenseId = await createExpense({
        name: values.newExpense,
        amount: values.newExpenseAmount,
        budgetId: id, // Use the current budget id
        userId,
      });
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
      // Refetch expenses after creation
      const updatedExpenses = await getAllMatchingItems({
        category: "expenses",
        key: "budgetId",
        value: id,
        userId,
      });
      setExpenses(updatedExpenses);
    } catch (e) {
      toast.error("There was a problem creating your expense.");
      console.error("Error creating expense:", e);
    }
  };

  const handleDeleteBudget = async () => {
    await deleteBudget({ params: { id } }, userId);
    // Delete the budget from DynamoDB via FastAPI
const response = await fetch(
  `${apiUrl}/delete-budget/${userId}/${id}`,
  {
      method: "DELETE",
  }
);
// const response = await fetch(
//   `http://localhost:8000/delete-budget/${userId}/${id}`,
//   {
//       method: "DELETE",
//   }
// );

if (!response.ok) {
  const errorData = await response.json();
  console.log("Response Error:", errorData);
  throw new Error("Failed to delete budget on server");
}

  };
  
  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteItem({
        key: "expenses",
        id: expenseId,
        userId,
      });
      const response = await fetch(
        `${apiUrl}/delete-expense/${userId}/${expenseId}`,
        {
          method: "DELETE",
        }
      );
      // const response = await fetch(
      //   `http://localhost:8000/delete-expense/${userId}/${expenseId}`,
      //   {
      //     method: "DELETE",
      //   }
      // );
  
      if (!response.ok) {
        throw new Error("Failed to delete expense on server");
      }
  
      toast.success("Expense deleted!");
  
      // Refetch expenses after deletion
      const updatedExpenses = await getAllMatchingItems({
        category: "expenses",
        key: "budgetId",
        value: id,
        userId,
      });
      fetchBudgetsAndExpenses(); 
      setExpenses(updatedExpenses);
      window.location.reload(true);  // Move this here
    } catch (e) {
      toast.error("There was a problem deleting your expense.");
      console.error("Error deleting expense:", e);
    }
  };
  

  if (!budget) {
    return <p>Loading...</p>; // Optionally show a loading state
  }
  console.log("onDelete function in BudgetPage:", handleDeleteExpense);


  return (
    <div
      className="grid-lg"
      style={{
        "--accent": budget.color,
      }}
    >
      <h1 className="h2">
        <span className="accent">{budget.name}</span> Overview
      </h1>
      <div className="flex-lg">
        <BudgetItem budget={budget} showDelete={true} onDelete={handleDeleteBudget} />
        <AddExpenseForm budgets={[budget]} onAction={handleCreateExpense} />
      </div>
      {expenses && expenses.length > 0 && (
        <div className="grid-md">
          <h2>
            <span className="accent">{budget.name}</span> Expenses
          </h2>
          <Table
            expenses={expenses}
            showBudget={false}
            onDelete={handleDeleteExpense}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
