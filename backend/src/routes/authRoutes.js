import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { registerValidation, loginValidation, validateRequest } from "../middlewares/security.js";

const router = Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

export default router;