import { createApp } from './app.js';
import { sampleData } from './seed.js';
import { TourStore } from './store.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp(new TourStore(sampleData()));

app.listen(port, () => {
  console.log(`Tour booking API running on http://localhost:${port}`);
});
