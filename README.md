# AgroBoost
AgroBoost is a comprehensive, AI-driven platform designed to empower farmers by providing crucial, real-time information and community support. It integrates intelligent crop recommendations, weather forecasting, a database of government schemes, and a Q&A forum into a single, easy-to-use dashboard, available in multiple Indian languages.

## Key Features

*   **🤖 AI-Powered Onboarding:** Simplifies registration by extracting user details from an Aadhaar card image using Google Gemini AI.
*   🌱 **Intelligent Crop Recommendation:** A machine learning model suggests optimal crops by analyzing soil nutrients (N, P, K), pH, and local weather data (temperature, humidity, rainfall).
*   🌦️ **Real-time Weather & Alerts:** Provides current conditions, 5-day forecasts, and critical weather alerts powered by the AccuWeather API.
*   🏛️ **Government Scheme Discovery:** A filterable database of agricultural schemes, allowing users to find relevant government support based on their state, gender, and income.
*   💬 **Farmer Community Forum:** An integrated Q&A platform for farmers to ask questions, share knowledge, and connect with peers and experts.
*   🌐 **Multi-Language Interface:** The user interface supports multiple Indian languages, including Hindi, Marathi, and Telugu, through an integrated Google Translate service.
*   👤 **Detailed User & Farm Profiles:** Enables users to manage personal and farm-specific data, including detailed soil analysis reports that power the recommendation engine.

## Architecture Overview

AgroBoost is built on a microservices-style architecture, comprising three main components that work in tandem:

*   **Frontend (React):** A modern client-side application built with React and Vite. It provides the complete user interface, including the dashboard, user profiles, and community forum. It communicates with both the Backend and AI services.

*   **Backend (Node.js):** An Express.js server that acts as the primary API gateway. It handles user authentication, manages forum and user data in MongoDB, serves weather data with a caching layer, and orchestrates crop recommendations by executing a dedicated Python script.

*   **AI Service (Python):** A lightweight Flask microservice dedicated to AI-related and data-processing tasks. It exposes endpoints for the Aadhaar card OCR (using Google Gemini) and for filtering and serving the database of government schemes.

## Technology Stack

| Component      | Technologies Used                                                              |
| -------------- | ------------------------------------------------------------------------------ |
| **Frontend**   | React, Vite, React Router, Tailwind CSS, Framer Motion, Axios                  |
| **Backend**    | Node.js, Express.js, Mongoose, MongoDB, `python-shell`                         |
| **AI Service** | Python, Flask, Google Gemini AI, `scikit-learn` (via the pickled model) |
| **Database**   | MongoDB                                                                        |

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js (v18 or higher)
*   Python (v3.8 or higher) and `pip`
*   MongoDB instance (local or cloud)
*   Git

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/raj2585/AgroBoost.git
    cd AgroBoost
    ```

2.  **Set up the Backend (Node.js):**
    *   Navigate to the backend directory: `cd backend`
    *   Install NPM packages: `npm install`
    *   Create a `.env` file in the `backend` directory and add your MongoDB connection string:
        ```env
        MONGODB_URI=mongodb://localhost:27017/agroboost
        ```
    *   Start the backend server:
        ```sh
        npm run dev
        ```
    *   The server will run on `http://localhost:3000`.

3.  **Set up the AI Service (Python):**
    *   Navigate to the AI directory: `cd AI`
    *   Install Python packages: `pip install -r requirements.txt`
    *   Set the `GOOGLE_API_KEY` environment variable required for Aadhaar OCR:
        ```sh
        # On Linux/macOS
        export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"

        # On Windows (Command Prompt)
        set GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
        ```
    *   Start the Flask server:
        ```sh
        python app.py
        ```
    *   The server will run on `http://localhost:5000`.

4.  **Set up the Frontend (React):**
    *   Navigate to the frontend directory: `cd frontend`
    *   Install NPM packages: `npm install`
    *   Start the Vite development server:
        ```sh
        npm run dev
        ```
    *   The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## API Endpoints

The application exposes REST APIs from two separate services.

### Backend Service (`http://localhost:3000`)

*   `/api/user/signup`: Creates a new user profile.
*   `/api/user/login`: Logs in a user based on their Aadhaar number.
*   `/api/crops/recommend`: Recommends crops based on soil and weather data.
*   `/api/weather/dashboard`: Provides formatted weather data for the dashboard.
*   `/api/questions`: Manages the community forum (GET, POST questions/answers).

### AI Service (`http://localhost:5000`)

*   `/api/signup`: Analyzes an uploaded Aadhaar card image and extracts user details (Name, Aadhaar ID, DOB, Location) as JSON.
*   `/api/schemes`: Returns a list of government agricultural schemes, with support for filtering by state, category, gender, and income.
