# SnapTracker Intelligence Platform 🛡️

SnapTracker is an autonomous, high-fidelity competitive intelligence platform designed to transform raw market data into strategic tactical advantages. By bypassing static databases and performing live reconnaissance, SnapTracker provides real-time insights into your competitors' pricing, features, and market sentiment.

## 🚀 Key Features

- **Autonomous Multi-Brand Recon**: Input natural language brand lists (e.g., "Stripe, PayPal, Adyen") and the system resolves official URLs and scrapes them in parallel.
- **AI Sales Correlation**: Cross-reference your product's sales trends against competitor feature launches to identify exact reasons for market shifts.
- **Strategic Differentiation Index**: Visualizes your unique value proposition mapped against the entire competitive landscape.
- **Intelligence Expansion**: Automated extraction of **Revenue**, **User Base**, and **Market Sentiment (G2/Capterra)** for every brand.
- **Historical Diffing**: Mathematically tracks word-level changes on competitor sites to detect strategic pivots instantly.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.10+)
- **Database**: SQLAlchemy / SQLite (Auto-migrating)
- **Intelligence**: Groq Llama-3.3-70b-versatile
- **Frontend**: React 18, Tailwind CSS (Dark-Ops Aesthetic)

## 📦 Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd fastapi_sqlite_crud
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**:
   Create a `.env` file or export your API key:
   ```bash
   export GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Launch the Server**:
   ```bash
   python main.py
   ```
   *The server will automatically initialize the SQLite database and host the React frontend.*

5. **Access the Console**:
   Open `http://localhost:8000` in your browser.

## 🛡️ License
Proprietary Intelligence Platform. All rights reserved. 2026.
