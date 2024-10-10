import express from "express";

export const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  next();
}
