const path = require("path");
const http = require("http"); // Import http
const { Server } = require("socket.io"); // Import Socket.io
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const Chat = require('./models/chatModel'); // Import Chat Model

dotenv.config({ path: "config.env" });

const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const mountRoutes = require("./Routes/mountRoutes");
const notFound = require("./middlewares/notFoundMiddleware");
// Database connection
dbConnection();

// express app
const app = express();
const server = http.createServer(app); // Create HTTP server

// Enable CORS - Allow to access from any website
app.use(cors());
app.options(/.*/, cors());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// compress all responses
app.use(compression());

// Middlewares
app.use(express.json({ limit: "20kb" }));
// Sanitize data
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);
// Serving static files
app.use(express.static(path.join(__dirname, "uploads")));

// Mount swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

// Handle not found routes
app.use(notFound);

// Global error handling middleware
app.use(globalError);

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("sendMessage", async (data) => {
    const { sender, receiver, message } = data;
    
    // Save to database
    try {
      const newChat = await Chat.create({
        sender,
        receiver,
        message,
      });

      // Emit to receiver
      io.to(receiver).emit("receiveMessage", newChat);
      // Emit back to sender (optional, for confirmation or multi-device)
      // io.to(sender).emit("receiveMessage", newChat); 
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
// Listen on server, not app
server.listen(PORT, () => {
  console.log(`App running at port:${PORT}`);
});

// Handling rejections outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shuting down....`);
    process.exit(1);
  });
});
