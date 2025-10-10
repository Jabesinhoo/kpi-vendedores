import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { loginValidation, validateRequest } from "../middlewares/security.js";

const router = Router();

router.post("/login", loginValidation, validateRequest, login);

export default router;