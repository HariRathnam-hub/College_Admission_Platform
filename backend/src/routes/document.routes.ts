import { Router } from "express";
import {
  uploadDocument,
  replaceDocument,
  listMyDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { uploadDocumentSchema } from "../validations/document.validation";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listMyDocuments);
router.get("/:id", getDocument);
router.post("/", upload.single("file"), validate(uploadDocumentSchema), uploadDocument);
router.put("/:id", upload.single("file"), replaceDocument);
router.delete("/:id", deleteDocument);

export default router;
