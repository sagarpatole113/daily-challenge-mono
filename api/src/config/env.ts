import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};
