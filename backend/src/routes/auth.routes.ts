import { Router } from "express";
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
