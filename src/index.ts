import app from "./app";
import { PORT } from "./constants/constants";

// start the CI server
app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
