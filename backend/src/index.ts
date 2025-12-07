import express from "express";
import cors from "cors";
import swaggerSpec from "./docs/swagger";
import { apiReference } from "@scalar/express-api-reference";

import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/docs",
  apiReference({
    spec: {
      content: swaggerSpec
    },
    theme: "default"
  })
);

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Docs: http://localhost:${PORT}/docs`);
});