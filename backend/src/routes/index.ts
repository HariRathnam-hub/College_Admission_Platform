import { Router } from "express";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import programRoutes from "./program.routes";
import applicationRoutes from "./application.routes";
import documentRoutes from "./document.routes";
import notificationRoutes from "./notification.routes";
import profileRoutes from "./profile.routes";
import adminRoutes from "./admin.routes";
import facultyRoutes from "./faculty.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/students", profileRoutes);
router.use("/programs", programRoutes);
router.use("/applications", applicationRoutes);
router.use("/documents", documentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/faculty", facultyRoutes);

export default router;
