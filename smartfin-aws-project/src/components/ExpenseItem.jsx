// rrd imports
import { Link, useFetcher } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import React, { useEffect, useState } from "react";
// library import
import { TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
// helper imports
import {
  formatCurrency,
  formatDateToLocaleString,
  getAllMatchingItems,
  deleteItem,
} from "../helpers";
const apiUrl = `http://13.201.127.231:8000`;

const ExpenseItem = ({ expense, showBudget, onDelete }) => {
  console.log("ExpenseItem onDelete prop:", onDelete); // This should log the function
  console.log("Is onDelete a function?", typeof onDelete === 'function');

  const fetcher = useFetcher();
  const { user } = useAuthenticator((context) => [context.user]);
  const userId = user.userId;
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      const fetchedBudget = await getAllMatchingItems({
        category: "budgets",
        key: "id",
        value: expense.budgetId,
        userId,
      });
      if (fetchedBudget.length > 0) {
        setBudget(fetchedBudget[0]);
      }
    };

    fetchBudget();
  }, [expense.budgetId, userId]);

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

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete the expense "${expense.name}"?`)) {
      try {
        console.log("Deleting expense with ID:", expense.id);
        await deleteItem({
          key: "expenses",
          id: expense.id,
          userId,
        });
      //   const updatedExpenses = await fetchData("expenses", userId);
      // setExpenses(updatedExpenses);
      console.log(expense.id);
      const response = await fetch(
        `${apiUrl}/delete-expense/${userId}/${expense.id}`,
        {
          method: "DELETE",
        }
      );
      // const response = await fetch(
      //   `http://localhost:8000/delete-expense/${userId}/${expense.id}`,
      //   {
      //     method: "DELETE",
      //   }
      // );  

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from the server
  toast.error(`Error: ${errorData.detail || "Failed to delete expense"}`);
        throw new Error("Failed to delete expense on server");
      }
        // Show the toast message
        window.location.reload(true);
        fetchBudgetsAndExpenses(); 
        toast.success("Expense deleted!");
      } catch (error) {
        console.error("Error during deletion:", error); // Log any errors
      }
    }
  };

  return (
    <>
      <td>{expense.name}</td>
      <td>{formatCurrency(expense.amount)}</td>
      <td>{formatDateToLocaleString(expense.createdAt)}</td>
      {showBudget && budget && (
        <td>
          <Link to={`/budget/${budget.id}`}>{budget.name}</Link>
        </td>
      )}
      <td>
        <button
          type="button"
          className="btn btn--warning"
          onClick={handleDelete}
          aria-label={`Delete ${expense.name} expense`}
        >
          <TrashIcon width={20} />
        </button>
      </td>
    </>
  );
};

export default ExpenseItem;
