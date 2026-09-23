import { Router } from "express";
import {
  listUsers,
  getUser,
  createStaffUser,
  updateUser,
  getAnalytics,
  broadcastNotification,
  listAllApplications,
  assignFacultyToApplication,
  adminChangeApplicationStatus,
  listAllDocuments,
} from "../controllers/admin.controller";
import { listAllProgramsForAdmin } from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  listUsersSchema,
  updateUserSchema,
  createStaffUserSchema,
  broadcastNotificationSchema,
  assignFacultySchema,
  adminChangeStatusSchema,
  listAllApplicationsSchema,
} from "../validations/admin.validation";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", validate(listUsersSchema), listUsers);
router.get("/users/:id", getUser);
router.post("/users", validate(createStaffUserSchema), createStaffUser);
router.patch("/users/:id", validate(updateUserSchema), updateUser);

router.get("/analytics", getAnalytics);

router.get("/programs", listAllProgramsForAdmin);

router.get("/applications", validate(listAllApplicationsSchema), listAllApplications);
router.patch("/applications/:id/assign", validate(assignFacultySchema), assignFacultyToApplication);
router.patch("/applications/:id/status", validate(adminChangeStatusSchema), adminChangeApplicationStatus);

router.get("/documents", listAllDocuments);

router.post("/notifications/broadcast", validate(broadcastNotificationSchema), broadcastNotification);

export default router;
