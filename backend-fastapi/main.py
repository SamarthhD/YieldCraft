from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import statistics
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title=os.getenv("APP_NAME", "YieldCraft Analytics Service"))

# Model for an investment record
class Investment(BaseModel):
    id: int
    user_id: int
    asset_name: str
    asset_type: str
    units: float
    purchase_price: float
    current_price: float

# Model for request body
class AnalyzeRequest(BaseModel):
    user_id: int
    investments: List[Investment]

# Analyze endpoint
@app.post("/analyze")
def analyze_portfolio(req: AnalyzeRequest):
    investments = req.investments
    total_value = sum(inv.units * inv.current_price for inv in investments)
    total_cost = sum(inv.units * inv.purchase_price for inv in investments)

    gain_loss_percent = 0.0
    if total_cost > 0:
        gain_loss_percent = round(((total_value - total_cost) / total_cost) * 100, 2)

    prices = [inv.current_price for inv in investments if inv.current_price]
    volatility = 0.0
    risk = "Low"
    if len(prices) > 1:
        volatility = round(statistics.stdev(prices), 2)
        if volatility < 5:
            risk = "Low"
        elif volatility < 20:
            risk = "Medium"
        else:
            risk = "High"

    return {
        "total_value": total_value,
        "gain_loss_percent": gain_loss_percent,
        "volatility": volatility,
        "risk": risk
    }

# Health check
@app.get("/")
def root():
    return {"message": f"{os.getenv('APP_NAME')} running in {os.getenv('ENV')} mode"}
