# Recipe Management System

A full-stack recipe application using HTML, CSS, Vanilla JavaScript, Node.js, and MySQL.

## Features
- **User Profile:** Create profiles with dietary preferences (stored in MySQL).
- **Recipe Search:** Integrated with Spoonacular API for real-time recipe data.
- **Smart Caching:** Uses localStorage to minimize API calls and improve performance.
- **Reviews:** Rate and review recipes (stored in MySQL).

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench.
2. Create a database named `RecipeSystem`.
3. Run the following SQL commands to create the tables:
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50),
       diet VARCHAR(50),
       allergies VARCHAR(100)
   );

   CREATE TABLE reviews (
       id INT AUTO_INCREMENT PRIMARY KEY,
       recipe_id INT,
       user_id INT,
       rating INT,
       comment TEXT,
       FOREIGN KEY (user_id) REFERENCES users(id)
   );

### 2. Project Installation
1. Open a terminal in the project folder 
2. Install dependencies 
    npm install 


### 3. Server configuration 
1. Open the server.js 
2. Locate the db connection settings
3. replace the 'YOUR_MYSQL_PASSWORD' with your MySQL root password 

### 4. API Key Configuration 
1. Open public/app.js 
2. Locate the API key constant at the top 
3. Paste you own Spoonacular API Key 


### How to Run 
1. Start the Backend Server in your terminal 
  - node server.js 

2. Launch the application by navigating to 'http://localhost:3000' in your browser 