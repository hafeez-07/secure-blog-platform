import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);

app.listen(PORT, () => {
  console.log(`App running on localhost : ${PORT}`);
});
