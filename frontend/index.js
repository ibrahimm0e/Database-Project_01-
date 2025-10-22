// Put this at the very top of your index.js
const style = document.createElement("style");
style.textContent = `
  body {
    background: linear-gradient(135deg, #1e293b, #0b3b4b, #3f2a72);
    color: white;
    font-family: 'Inter', sans-serif;
    margin: 0;
  }
  main {
    background: rgba(255,255,255,0.05);
    padding: 20px;
    border-radius: 18px;
    width: 90%;
    max-width: 800px;
    margin: 50px auto;
  }
  button {
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }
  #add-name-btn { background: #6366f1; color: white; }
  #search-btn { background: #374151; color: white; }
  #update-row-btn { background: #22c55e; color: #04130a; }
`;
document.head.appendChild(style);
