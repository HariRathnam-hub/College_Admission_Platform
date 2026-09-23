import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Application, WITHDRAWABLE_STATUSES } from "../models/Application.model";
import { Program } from "../models/Program.model";
import { DocumentFile, MANDATORY_DOCUMENT_TYPES, MANDATORY_DOCUMENT_LABELS } from "../models/DocumentFile.model";
import { UpdateApplicationInput } from "../validations/application.validation";
import { notify } from "../utils/notify";

export const startApplication = asyncHandler(async (req: Request, res: Response) => {
  const { programId } = req.body as { programId: string };

  const program = await Program.findById(programId);
  if (!program || !program.isActive) {
    throw ApiError.notFound("Program not found or not accepting applications");
  }

  const existing = await Application.findOne({ student: req.user!.userId, program: programId });
  if (existing) {
    return res.status(200).json(new ApiResponse("Draft application already exists", existing));
  }

  const application = await Application.create({
    student: req.user!.userId,
    program: programId,
    status: "DRAFT",
    statusHistory: [{ status: "DRAFT", changedAt: new Date(), changedBy: req.user!.userId }],
  });

  res.status(201).json(new ApiResponse("Application draft created", application));
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateApplicationInput;
  const application = await Application.findById(req.params.id);

  if (!application) throw ApiError.notFound("Application not found");
  if (application.student.toString() !== req.user!.userId) throw ApiError.forbidden();
  if (application.status !== "DRAFT" && !application.correctionRequested) {
    throw ApiError.badRequest("This application cannot be edited in its current state.");
  }

  if (body.personalStatement !== undefined) application.personalStatement = body.personalStatement;
  if (body.academicDetails) {
    application.academicDetails = { ...application.academicDetails, ...body.academicDetails };
  }

  await application.save();
  res.status(200).json(new ApiResponse("Application draft updated", application));
});

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  if (application.student.toString() !== req.user!.userId) throw ApiError.forbidden();
  const isResubmission = !!application.correctionRequested;
  if (application.status !== "DRAFT" && !isResubmission) {
    throw ApiError.badRequest("Application has already been submitted");
  }
  if (application.documents.length === 0) {
    throw ApiError.badRequest("Upload at least one document before submitting");
  }

  const uploadedDocs = await DocumentFile.find({ _id: { $in: application.documents } }).select("type status");
  const uploadedTypes = new Set(uploadedDocs.filter((d) => d.status !== "REJECTED").map((d) => d.type));
  const missing = MANDATORY_DOCUMENT_TYPES.filter((type) => !uploadedTypes.has(type));
  if (missing.length > 0) {
    throw ApiError.badRequest(
      `Please upload the following required documents before submitting: ${missing
        .map((type) => MANDATORY_DOCUMENT_LABELS[type] ?? type)
        .join(", ")}`
    );
  }

  application.status = "SUBMITTED";
  application.submittedAt = new Date();
  application.correctionRequested = undefined;
  application.statusHistory.push({
    status: "SUBMITTED",
    note: isResubmission ? "Resubmitted after correction" : undefined,
    changedAt: new Date(),
    changedBy: req.user!.userId as any,
  });
  await application.save();

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: req.user!.userId,
    type: "APPLICATION_STATUS_CHANGE",
    title: "Application submitted",
    message: `Your application for ${programName} has been submitted successfully.`,
    relatedApplication: application._id,
    sendEmailToo: true,
    emailContext: { programName, status: "SUBMITTED" },
  });

  res.status(200).json(new ApiResponse("Application submitted", application));
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  if (application.student.toString() !== req.user!.userId) throw ApiError.forbidden();
  if (!WITHDRAWABLE_STATUSES.includes(application.status)) {
    throw ApiError.badRequest("This application can no longer be withdrawn");
  }

  application.status = "WITHDRAWN";
  application.withdrawnAt = new Date();
  application.withdrawReason = reason;
  application.statusHistory.push({
    status: "WITHDRAWN",
    note: reason,
    changedAt: new Date(),
    changedBy: req.user!.userId as any,
  });
  await application.save();

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: req.user!.userId,
    type: "APPLICATION_STATUS_CHANGE",
    title: "Application withdrawn",
    message: `Your application for ${programName} has been withdrawn.`,
    relatedApplication: application._id,
  });

  res.status(200).json(new ApiResponse("Application withdrawn", application));
});

export const listMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await Application.find({ student: req.user!.userId })
    .populate("program", "name code department degreeLevel")
    .sort({ updatedAt: -1 });

  res.status(200).json(new ApiResponse("Applications fetched", applications));
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id)
    .populate("program")
    .populate("documents");

  if (!application) throw ApiError.notFound("Application not found");

  const isOwner = application.student.toString() === req.user!.userId;
  const isStaff = req.user!.role === "FACULTY" || req.user!.role === "ADMIN";
  if (!isOwner && !isStaff) throw ApiError.forbidden();

  res.status(200).json(new ApiResponse("Application fetched", application));
});

export const deleteDraftApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound("Application not found");
  if (application.student.toString() !== req.user!.userId) throw ApiError.forbidden();
  if (application.status !== "DRAFT") {
    throw ApiError.badRequest("Only draft applications can be deleted");
  }
  await application.deleteOne();
  res.status(200).json(new ApiResponse("Draft application deleted"));
});
