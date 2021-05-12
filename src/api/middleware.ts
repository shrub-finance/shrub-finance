import Express from "express";
import { ObjectId } from "bson";
import fs from "fs";

export enum CacheTimes {
  None = 0,
  Second = 1,
  Minute = 60,
  Hour = CacheTimes.Minute * 60,
  Day = CacheTimes.Hour * 24,
  Month = CacheTimes.Day * 30,
  Year = CacheTimes.Day * 365,
}

export function SetCache(
  res: Express.Response,
  serverSeconds: number,
  browserSeconds: number = 0
) {
  res.setHeader(
    "Cache-Control",
    `s-maxage=${serverSeconds}, max-age=${browserSeconds}`
  );
}

export function CacheMiddleware(
  serverSeconds = CacheTimes.Second,
  browserSeconds = CacheTimes.Second
) {
  return (
    _: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    SetCache(res, serverSeconds, browserSeconds);
    next();
  };
}

export function SetNoCache(
  res: Express.Response,
  serverSeconds: number,
  browserSeconds: number = 0
) {
  res.setHeader("Cache-Control", "no-cache, no-store, private");
}

export function NoCacheMiddleware(
  serverSeconds = CacheTimes.Second,
  browserSeconds = CacheTimes.Second
) {
  return (
    _: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    SetNoCache(res, serverSeconds, browserSeconds);
    next();
  };
}
