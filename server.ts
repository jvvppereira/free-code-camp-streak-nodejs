import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/streak?username=QuincyLarson`);
});