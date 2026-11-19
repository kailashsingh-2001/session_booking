import 'dotenv/config';                       // add this as the very first line
import app from './app';
import { connectDB } from './config/db';

const PORT = Number(process.env.PORT) || 5000;   // add this

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();