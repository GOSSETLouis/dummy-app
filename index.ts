import express, { Request, Response } from "express";
import os from "os";
import process from "process";
import { Redis } from "ioredis";
import mysql from "mysql2";
import { promisify } from "util";
import fs from "fs";
const app = express();
const port = +(process.env.PORT ?? "8080");

enum Status {
  OK = "OK",
  KO = "KO",
}

interface TestData {
  [key: string]: Status;
}

app.get("/", async (req: Request, res: Response) => {
  const data: TestData = {
    port: Status.KO,
    hostname: Status.KO,
    redis: Status.KO,
    mysql: Status.KO,
    user: Status.KO,
    file: Status.KO,
  };

  // Port check
  if (port === 1337) {
    data.port = Status.OK;
  }

  // Hostname check
  if (os.hostname() === "mydocker") {
    data.hostname = Status.OK;
  }

  // POSIX UID check
  if (process.getuid && process.getuid() !== 0) {
    data.user = Status.OK;
  }

  // Redis check
  try {
    const redisClient = new Redis({
      port: +(process.env.REDIS_PORT ?? "6379"),
      host: process.env.REDIS_HOST ?? "localhost",
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });
    try {
      const result = await redisClient.ping();
      if (result === "PONG") {
        data.redis = Status.OK;
      }
      await redisClient.quit();
    } catch (err) {
      await redisClient.quit();
    }
  } catch (err) {
    console.error(err);
  }

  // MySQL check
  try {
    const mysqlConnection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });

    const query = promisify(mysqlConnection.query).bind(mysqlConnection);

    const result = await query({sql: "SELECT 1"});
    if (result) {
      console.log(result);
      data.mysql = Status.OK;
    }
    mysqlConnection.destroy();
  } catch (err) {
    console.error(err);
  }

  try {
    const filePathToCheck = process.env.FILE_PATH_TO_CHECK ?? "./dummy.txt";
    if (fs.existsSync(filePathToCheck)) {
      data.file = Status.OK;
    }
  } catch (err) {
    console.log(err);
  }
  res.json(data);
});

app.listen(port, () => {
  console.log(`Dummy app listening on port ${port}`);
});
