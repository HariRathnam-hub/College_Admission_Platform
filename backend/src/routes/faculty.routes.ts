import { Router } from "express";
import {
  listApplicationsForReview,
  claimApplication,
  changeApplicationStatus,
  submitReview,
  listReviewsForApplication,
  requestCorrection,
  addApplicationNote,
  sendMessageToStudent,
  updateDocumentStatus,
  listDocumentsForReview,
  getFacultyDashboardStats,
  getMyFacultyProfile,
  updateMyFacultyProfile,
} from "../controllers/faculty.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  listReviewApplicationsSchema,
  changeStatusSchema,
  requestCorrectionSchema,
  addNoteSchema,
  sendMessageSchema,
  submitReviewSchema,
  documentStatusSchema,
  updateFacultyProfileSchema,
} from "../validations/faculty.validation";

const router = Router();

router.use(authenticate, authorize("FACULTY", "ADMIN"));

router.get("/profile/me", getMyFacultyProfile);
router.put("/profile/me", validate(updateFacultyProfileSchema), updateMyFacultyProfile);

router.get("/dashboard-stats", getFacultyDashboardStats);

router.get("/applications", validate(listReviewApplicationsSchema), listApplicationsForReview);
router.patch("/applications/:id/claim", claimApplication);
router.patch("/applications/:id/status", validate(changeStatusSchema), changeApplicationStatus);
router.post("/applications/:id/review", validate(submitReviewSchema), submitReview);
router.get("/applications/:id/reviews", listReviewsForApplication);
router.patch("/applications/:id/request-correction", validate(requestCorrectionSchema), requestCorrection);
router.post("/applications/:id/notes", validate(addNoteSchema), addApplicationNote);
router.post("/applications/:id/message", validate(sendMessageSchema), sendMessageToStudent);
router.patch("/documents/:id/status", validate(documentStatusSchema), updateDocumentStatus);
router.get("/documents", listDocumentsForReview);

export default router;
