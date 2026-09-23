import { Router } from "express";
import {
  startApplication,
  updateApplication,
  submitApplication,
  withdrawApplication,
  listMyApplications,
  getApplication,
  deleteDraftApplication,
} from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createApplicationSchema, updateApplicationSchema, withdrawApplicationSchema } from "../validations/application.validation";

const router = Router();

router.use(authenticate);

router.get("/", authorize("STUDENT"), listMyApplications);
router.post("/", authorize("STUDENT"), validate(createApplicationSchema), startApplication);
router.get("/:id", getApplication);
router.patch("/:id", authorize("STUDENT"), validate(updateApplicationSchema), updateApplication);
router.post("/:id/submit", authorize("STUDENT"), submitApplication);
router.post("/:id/withdraw", authorize("STUDENT"), validate(withdrawApplicationSchema), withdrawApplication);
router.delete("/:id", authorize("STUDENT"), deleteDraftApplication);

export default router;
