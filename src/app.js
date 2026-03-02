const express = require("express");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const { enableUser, disableUser } = require("./controllers/user.controller");

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "User-Role API is running" });
});

app.post("/enable", enableUser);
app.post("/disable", disableUser);

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

app.use((err, _req, res, _next) => {
  return res.status(500).json({ message: err.message });
});

module.exports = app;
