import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "../components/Table";
import { deleteItem, fetchData } from "../helpers";
import useAuth from "../hooks/useAuth";
const apiUrl = `http://13.201.127.231:8000`;

const ExpensesPage = () => {
  const userId = useAuth(); // Get the userId from the auth hook
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
    const fetchExpenses = async () => {
      try {
        const fetchedExpenses = await fetchData("expenses", userId);
        setExpenses(fetchedExpenses);
      } catch (e) {
        toast.error("There was a problem fetching expenses.");
        console.error("Error fetching expenses:", e);
      }
    };

    fetchExpenses();
  }, [userId]); // Fetch expenses when userId changes

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
      const updatedExpenses = await fetchData("expenses", userId);
      
      fetchBudgetsAndExpenses(); setExpenses(updatedExpenses);
      window.location.reload(true);
    } catch (e) {
      toast.error("There was a problem deleting your expense.");
      console.error("Error deleting expense:", e);
    }
  };

  return (
    <div className="grid-lg">
      <h1 className="h2">Expenses</h1>
      {expenses && expenses.length > 0 ? (
        <Table expenses={expenses} showBudget={true} onDelete={handleDeleteExpense} />
      ) : (
        <p>No expenses found</p>
      )}
    </div>
  );
};

export default ExpensesPage;
