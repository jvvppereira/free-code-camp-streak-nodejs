# 🔥 freeCodeCamp Streak Badge API

A simple and efficient Node.js API with Express that consumes the public [freeCodeCamp](https://www.freecodecamp.org) API to generate a personalized, dynamic SVG badge displaying the user's current consecutive study days (streak) and progress over the last 7 days.

This badge is perfect to be added to your GitHub profile, portfolio, or blog!

---

## 🎨 SVG Badge Example

The generated badge has a modern dark-mode design with the following features:
- 🔥 Visual indicator of the current consecutive days streak.
- 📅 Timeline of the last 7 days showing each day's status:
  - 🟢 Green circle with a checkmark (`✓`) for days with completed challenges.
  - 🔘 Gray circle with an X (`✗`) for days with no challenges.
- 💬 Motivational message based on today's current status.

---

## 🚀 Features

- **Direct Integration**: Fetches public profile data directly from the freeCodeCamp API.
- **Streak Calculation**: Algorithm that accurately calculates consecutive days of study based on challenge completion dates.
- **Weekly History**: Maps daily progress over the last 7 days.
- **Native SVG Generation**: No heavy image rendering dependencies; the SVG is built natively and quickly.
- **Cache Optimization**: Configured with proper HTTP headers (`Cache-Control`) to prevent redundant requests when hosted (e.g., Vercel, Railway) and ensure good performance on GitHub.

---

## ⚙️ Technologies Used

- **Node.js** (v18+ recommended)
- **Express.js** (minimalist web framework)
- **Native Fetch API** (communication with the freeCodeCamp API)

---

## 💻 How to Run the Project Locally

### Prerequisites

Make sure you have **Node.js** installed on your machine.

### Installation Steps

1. Clone the repository or navigate to the project folder:
   ```bash
   cd free-code-camp-streak-nodejs
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   * **For production:**
     ```bash
     npm start
     ```
   * **For development (with automatic reloading):**
     ```bash
     npm run dev
     ```

The server will start by default on port `3000` (or the port configured via the `PORT` environment variable):
```
Server running on http://localhost:3000
Try: http://localhost:3000/streak?username=QuincyLarson
```

---

## 🔌 How to Use (Endpoints)

### Get Streak Badge

* **Endpoint:** `/streak`
* **Method:** `GET`
* **Query Parameters:**
  - `username` (required): Your public freeCodeCamp username.
  - `width` (optional): The custom width for the SVG badge (default: `540`).
  - `height` (optional): The custom height for the SVG badge (default: `190`).
  - `timezone` (optional): Timezone name (e.g. `America/Sao_Paulo`, `UTC`) or numeric UTC offset (e.g. `-3`, `+5.5`) for streak calculation (default: `UTC`).

#### Request Example:
```http
GET http://localhost:3000/streak?username=QuincyLarson
```

Request with custom dimensions and timezone:
```http
GET http://localhost:3000/streak?username=jvvppereira&width=600&height=220&timezone=America/Sao_Paulo
```

#### How to embed in your GitHub README:
Simply add the URL of your hosted or local API into a GitHub markdown image tag:

```markdown
![freeCodeCamp Streak](https://your-domain.com/streak?username=your-username)
```

---

## 📁 Project Structure

```text
├── services/
│   ├── freeCodeCampService.js  # Consumes the FCC API and calculates streak/weekly status
│   └── svgService.js          # Dynamically generates the SVG badge code
├── package.json               # Project dependency manager and scripts
├── server.js                  # Express application entry point and route handling
└── README.md                  # This main documentation file
```

---

## 🤝 Contributing

Contributions are super welcome! Feel free to open an *Issue* or submit a *Pull Request* to improve the badge styles, add new features, or optimize the code.

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License.
