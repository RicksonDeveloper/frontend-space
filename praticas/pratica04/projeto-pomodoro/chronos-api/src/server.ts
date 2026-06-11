import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT) || 3333;

app.listen(port, () => {
  console.log(`Chronos API running at http://localhost:${port}`);
});
