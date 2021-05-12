import mongoose from "mongoose";
const Config = {
  dbHost: process.env.DB_HOST || "localhost",
  dbName: process.env.DB_NAME || "shrub",
  dbPort: process.env.DB_PORT || "27017",
};
export function Storage() {
  const { dbHost, dbPort, dbName } = Config;
  const url = `mongodb://${dbHost}:${dbPort}/${dbName}?socketTimeoutMS=3600000&noDelay=true`;
  console.log("Connecting to database at", url);
  return mongoose.connect(url, { useNewUrlParser: true });
}
