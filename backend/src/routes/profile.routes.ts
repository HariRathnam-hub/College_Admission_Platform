import { Router } from "express";
import { getMyProfile, updateMyProfile, getStudentProfileForStaff } from "../controllers/profile.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validations/profile.validation";

const router = Router();

router.use(authenticate);

router.get("/me", authorize("STUDENT"), getMyProfile);
router.put("/me", authorize("STUDENT"), validate(updateProfileSchema), updateMyProfile);
router.get("/:userId/profile", authorize("FACULTY", "ADMIN"), getStudentProfileForStaff);

export default router;
