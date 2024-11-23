from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import boto3
from decimal import Decimal

# uvicorn main:app --reload
#uvicorn main:app --host 0.0.0.0 --port 8000
#source myenv/bin/activate
#deactivate

app = FastAPI()

dynamodb = boto3.resource('dynamodb',
                    aws_access_key_id = '',
                    aws_secret_access_key = '',
                    region_name='ap-south-1'
                          )


# Set up CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://aws-smartfin-deploy-testing.s3-website.ap-south-1.amazonaws.com/",
    "*",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


budget_table = dynamodb.Table('Budgets')
expense_table = dynamodb.Table('Expenses')

class Budget(BaseModel):
    name: str
    amount: float
    userId: str

class Expense(BaseModel):
    name: str
    amount: float
    budgetId: str
    userId: str

@app.post("/create-budget/{budgetId}")
async def create_budget(budget: Budget, budgetId: str):
    budget_id = budgetId
    budget_data = {
        'budgetId': budget_id,
        'name': budget.name,
        'amount': Decimal(str(budget.amount)),
        'userId': budget.userId
    }
    # try:
    #     budget_table.put_item(Item=budget_data)
    #     return {"message": "Budget created successfully!", "id": budget_id}
    # except Exception as e:
    #     print(f"Error: {e}")  # Log the error
    #     raise HTTPException(status_code=500, detail=f"Failed to create budget: {str(e)}")
    try:
        # Check if a budget with the same budgetId already exists for the given userId
        response = budget_table.get_item(Key={'userId': budget.userId, 'budgetId': budgetId})

        if 'Item' in response:  # If the item exists, we should not overwrite
            raise HTTPException(status_code=400, detail=f"Budget with ID {budgetId} already exists for user {budget.userId}.")
        
        # Proceed to create the new budget since it doesn't exist
        budget_table.put_item(Item=budget_data)
        return {"message": "Budget created successfully!", "id": budgetId}
    
    except Exception as e:
        print(f"Error while creating budget: {e}")  # Log the error
        raise HTTPException(status_code=500, detail=f"Failed to create budget: {str(e)}")

@app.post("/create-expense/{expenseId}")
async def create_expense(expense: Expense, expenseId: str):
    expense_id = expenseId
    expense_data = {
        'expenseId': expense_id,
        'name': expense.name,
        'amount': Decimal(str(expense.amount)),
        'budgetId': expense.budgetId,
        'userId': expense.userId
    }

    try:
        # Check if an expense with the same expenseId already exists for the given userId
        response = expense_table.get_item(Key={'userId': expense.userId, 'expenseId': expenseId})

        if 'Item' in response:  # If the item exists, we should not overwrite
            raise HTTPException(status_code=400, detail=f"Expense with ID {expenseId} already exists for user {expense.userId}.")
        
        # Proceed to create the new expense since it doesn't exist
        expense_table.put_item(Item=expense_data)
        return {"message": "Expense created successfully!", "id": expense_id}
    
    except Exception as e:
        print(f"Error while creating expense: {e}")  # Log the error
        raise HTTPException(status_code=500, detail=f"Failed to create expense: {str(e)}")


@app.delete("/delete-expense/{userId}/{expense_id}")
async def delete_expense(userId: str, expense_id: str):
    try:
        # Attempt to delete the item using both the userId and expenseId as keys
        response = expense_table.delete_item(
            Key={
                'userId': userId,
                'expenseId': expense_id
            },
            ConditionExpression="attribute_exists(expenseId)"
        )
        
        # Check if the deletion was successful by checking the HTTP status code
        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            return {"message": "Expense deleted successfully!"}
        else:
            raise HTTPException(status_code=404, detail="Expense not found")
    
    except Exception as e:
        print(f"Error during deletion of expense ID {expense_id} for user {userId}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/delete-budget/{userId}/{budgetId}")
async def delete_budget(userId: str, budgetId: str):
    try:
        # Delete the budget
        budget_response = budget_table.delete_item(
            Key={
                'userId': userId,
                'budgetId': budgetId
            },
            ConditionExpression="attribute_exists(budgetId)"
        )

        # Check if the budget deletion was successful
        if budget_response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
            raise HTTPException(status_code=404, detail="Budget not found")

        # Find all associated expenses with this budgetId
        expenses_response = expense_table.query(
            IndexName='budgetId-index',  # Ensure your table has a GSI on budgetId if querying on it
            KeyConditionExpression="userId = :userId AND budgetId = :budgetId",
            ExpressionAttributeValues={
                ':userId': userId,
                ':budgetId': budgetId
            }
        )

        # Get all associated expenses
        expenses = expenses_response.get('Items', [])

        # Delete each associated expense
        for expense in expenses:
            expense_table.delete_item(
                Key={
                    'userId': userId,
                    'expenseId': expense['expenseId']
                }
            )

        return {"message": "Budget and associated expenses deleted successfully!"}

    except Exception as e:
        print(f"Error while deleting budget {budgetId} for user {userId}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete budget: {str(e)}")
