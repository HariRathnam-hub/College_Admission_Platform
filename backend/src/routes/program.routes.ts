import { Router } from "express";
import { listPrograms, getProgram, createProgram, updateProgram, deleteProgram } from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { listProgramsSchema, createProgramSchema } from "../validations/program.validation";
import { updateProgramSchema } from "../validations/admin.validation";

const router = Router();

router.get("/", validate(listProgramsSchema), listPrograms);
router.get("/:id", getProgram);
router.post("/", authenticate, authorize("ADMIN"), validate(createProgramSchema), createProgram);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateProgramSchema), updateProgram);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProgram);

export default router;
