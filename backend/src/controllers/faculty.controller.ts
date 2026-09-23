import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Application, ApplicationStatus, FACULTY_SETTABLE_STATUSES } from "../models/Application.model";
import { DocumentFile } from "../models/DocumentFile.model";
import { Review } from "../models/Review.model";
import { FacultyProfile } from "../models/FacultyProfile.model";
import { notify } from "../utils/notify";
import { recordAudit } from "../utils/audit";

export const getMyFacultyProfile = asyncHandler(async (req: Request, res: Response) => {
  let profile = await FacultyProfile.findOne({ user: req.user!.userId });
  if (!profile) {
    profile = await FacultyProfile.create({ user: req.user!.userId });
  }
  res.status(200).json(new ApiResponse("Faculty profile fetched", profile));
});

export const updateMyFacultyProfile = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { department?: string; designation?: string; phone?: string; specialization?: string[] };

  let profile = await FacultyProfile.findOne({ user: req.user!.userId });
  if (!profile) {
    profile = new FacultyProfile({ user: req.user!.userId });
  }

  if (body.department !== undefined) profile.department = body.department;
  if (body.designation !== undefined) profile.designation = body.designation;
  if (body.phone !== undefined) profile.phone = body.phone;
  if (body.specialization !== undefined) profile.specialization = body.specialization;

  await profile.save();
  res.status(200).json(new ApiResponse("Faculty profile updated", profile));
});

function ensureAssignedOrAdmin(req: Request, assignedFaculty?: unknown) {
  if (req.user!.role === "ADMIN") return;
  const assignedId = (assignedFaculty as { toString(): string } | undefined)?.toString();
  if (assignedId !== req.user!.userId) {
    throw ApiError.forbidden("This application is not assigned to you");
  }
}

export const listApplicationsForReview = asyncHandler(async (req: Request, res: Response) => {
  const { status, program, search, scope } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const filter: Record<string, unknown> = { status: { $ne: "DRAFT" } };
  if (status) filter.status = status;
  if (program) filter.program = program;

  if (req.user!.role === "FACULTY") {
    if (scope === "unassigned") {
      filter.assignedFaculty = { $exists: false };
    } else {
      // Default scope for faculty is their own assigned queue.
      filter.assignedFaculty = req.user!.userId;
    }
  }
  // ADMIN sees everything by default (no assignedFaculty filter), matching prior behavior.

  let query = Application.find(filter)
    .populate("student", "name email")
    .populate("program", "name code department")
    .populate("assignedFaculty", "name email")
    .sort({ updatedAt: -1 });

  if (search) {
    // Filter in-memory on populated student name/email since Mongoose can't $regex across refs directly.
    const all = await query;
    const filtered = all.filter((app) => {
      const student = app.student as unknown as { name: string; email: string };
      const term = search.toLowerCase();
      return student?.name?.toLowerCase().includes(term) || student?.email?.toLowerCase().includes(term);
    });
    const paged = filtered.slice((page - 1) * limit, page * limit);
    res.status(200).json(
      new ApiResponse("Applications fetched", {
        applications: paged,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      })
    );
    return;
  }

  const [applications, total] = await Promise.all([
    query.skip((page - 1) * limit).limit(limit),
    Application.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse("Applications fetched", {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

export const claimApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound("Application not found");
  if (application.assignedFaculty) {
    throw ApiError.conflict("This application is already assigned to a reviewer");
  }

  application.assignedFaculty = req.user!.userId as any;
  await application.save();

  await recordAudit({
    req,
    action: "APPLICATION_CLAIMED",
    targetType: "Application",
    targetId: application._id,
  });

  res.status(200).json(new ApiResponse("Application claimed", application));
});

export const changeApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: ApplicationStatus; note?: string };

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  if (application.status === "DRAFT") {
    throw ApiError.badRequest("Draft applications have not been submitted yet");
  }
  ensureAssignedOrAdmin(req, application.assignedFaculty);
  if (!FACULTY_SETTABLE_STATUSES.includes(status)) {
    throw ApiError.forbidden("Faculty reviewers cannot set this status");
  }

  const previousStatus = application.status;
  application.status = status;
  application.reviewedBy = req.user!.userId as any;
  application.statusHistory.push({
    status,
    note,
    changedAt: new Date(),
    changedBy: req.user!.userId as any,
  });
  await application.save();

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: application.student,
    type: "APPLICATION_STATUS_CHANGE",
    title: "Application status updated",
    message: `Your application for ${programName} is now ${status.replace(/_/g, " ")}.`,
    relatedApplication: application._id,
    sendEmailToo: true,
    emailContext: { programName, status, note },
  });

  await recordAudit({
    req,
    action: "APPLICATION_STATUS_CHANGED",
    targetType: "Application",
    targetId: application._id,
    meta: { from: previousStatus, to: status, note },
  });

  res.status(200).json(new ApiResponse("Application status updated", application));
});

export const submitReview = asyncHandler(async (req: Request, res: Response) => {
  const { recommendation, comments } = req.body as {
    recommendation: "RECOMMEND_APPROVE" | "RECOMMEND_REJECT";
    comments: string;
  };

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  ensureAssignedOrAdmin(req, application.assignedFaculty);

  const review = await Review.create({
    application: application._id,
    reviewer: req.user!.userId,
    recommendation,
    comments,
  });

  const nextStatus: ApplicationStatus = recommendation === "RECOMMEND_APPROVE" ? "FACULTY_APPROVED" : "FACULTY_REJECTED";
  application.status = nextStatus;
  application.reviewedBy = req.user!.userId as any;
  application.statusHistory.push({
    status: nextStatus,
    note: comments,
    changedAt: new Date(),
    changedBy: req.user!.userId as any,
  });
  await application.save();

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: application.student,
    type: "APPLICATION_STATUS_CHANGE",
    title: "Faculty review complete",
    message: `Your application for ${programName} has been reviewed: ${nextStatus.replace(/_/g, " ")}.`,
    relatedApplication: application._id,
    sendEmailToo: true,
    emailContext: { programName, status: nextStatus, note: comments },
  });

  await recordAudit({
    req,
    action: "APPLICATION_REVIEWED",
    targetType: "Application",
    targetId: application._id,
    meta: { recommendation, comments },
  });

  res.status(201).json(new ApiResponse("Review submitted", { review, application }));
});

export const listReviewsForApplication = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ application: req.params.id })
    .populate("reviewer", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse("Reviews fetched", reviews));
});

export const requestCorrection = asyncHandler(async (req: Request, res: Response) => {
  const { note } = req.body as { note: string };

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  if (application.status === "DRAFT") {
    throw ApiError.badRequest("Draft applications have not been submitted yet");
  }
  ensureAssignedOrAdmin(req, application.assignedFaculty);

  application.status = "DRAFT";
  application.correctionRequested = note;
  application.reviewedBy = req.user!.userId as any;
  application.statusHistory.push({
    status: "DRAFT",
    note: `Correction requested: ${note}`,
    changedAt: new Date(),
    changedBy: req.user!.userId as any,
  });
  await application.save();

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: application.student,
    type: "CORRECTION_REQUESTED",
    title: "Correction requested on your application",
    message: `Please review and update your application for ${programName}: ${note}`,
    relatedApplication: application._id,
    sendEmailToo: true,
    emailContext: { programName, status: "CORRECTION_REQUESTED", note },
  });

  await recordAudit({
    req,
    action: "APPLICATION_CORRECTION_REQUESTED",
    targetType: "Application",
    targetId: application._id,
    meta: { note },
  });

  res.status(200).json(new ApiResponse("Correction requested", application));
});

export const addApplicationNote = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as { message: string };

  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound("Application not found");
  ensureAssignedOrAdmin(req, application.assignedFaculty);

  application.officerNotes.push({
    author: req.user!.userId as any,
    message,
    createdAt: new Date(),
  });
  await application.save();

  res.status(201).json(new ApiResponse("Note added", application));
});

export const sendMessageToStudent = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as { message: string };

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  ensureAssignedOrAdmin(req, application.assignedFaculty);

  const programName = (application.program as any)?.name ?? "your program";
  await notify({
    recipientId: application.student,
    type: "GENERAL",
    title: `Message regarding your ${programName} application`,
    message,
    relatedApplication: application._id,
  });

  await recordAudit({
    req,
    action: "APPLICATION_MESSAGE_SENT",
    targetType: "Application",
    targetId: application._id,
    meta: { message },
  });

  res.status(201).json(new ApiResponse("Message sent to student"));
});

export const updateDocumentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, rejectionReason, remarks } = req.body as {
    status: "PENDING" | "VERIFIED" | "REJECTED";
    rejectionReason?: string;
    remarks?: string;
  };

  const document = await DocumentFile.findById(req.params.id);
  if (!document) throw ApiError.notFound("Document not found");
  if (document.application) {
    const application = await Application.findById(document.application);
    if (application) ensureAssignedOrAdmin(req, application.assignedFaculty);
  }

  document.status = status;
  document.rejectionReason = status === "REJECTED" ? rejectionReason : undefined;
  document.remarks = remarks;
  document.verifiedBy = req.user!.userId as any;
  document.verificationDate = new Date();
  await document.save();

  await notify({
    recipientId: document.owner,
    type: "DOCUMENT_STATUS_CHANGE",
    title: `Document ${status.toLowerCase()}`,
    message:
      status === "REJECTED"
        ? `Your document "${document.originalName}" was rejected. ${rejectionReason ?? ""}`.trim()
        : `Your document "${document.originalName}" was ${status.toLowerCase()}.`,
    relatedApplication: document.application,
  });

  await recordAudit({
    req,
    action: "DOCUMENT_STATUS_CHANGED",
    targetType: "DocumentFile",
    targetId: document._id,
    meta: { status, rejectionReason, remarks },
  });

  res.status(200).json(new ApiResponse("Document status updated", document));
});

export const listDocumentsForReview = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string };

  const applicationFilter: Record<string, unknown> =
    req.user!.role === "ADMIN" ? {} : { assignedFaculty: req.user!.userId };
  const applicationIds = await Application.find(applicationFilter).distinct("_id");

  const documentFilter: Record<string, unknown> = { application: { $in: applicationIds } };
  if (status) documentFilter.status = status;

  const documents = await DocumentFile.find(documentFilter)
    .populate("owner", "name email")
    .populate("application", "program status")
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json(new ApiResponse("Documents fetched", documents));
});

export const getFacultyDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const facultyId = req.user!.userId;
  const filter = req.user!.role === "ADMIN" ? {} : { assignedFaculty: facultyId };

  const [assigned, pending, approved, rejected] = await Promise.all([
    Application.countDocuments(filter),
    Application.countDocuments({ ...filter, status: { $in: ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING"] } }),
    Application.countDocuments({ ...filter, status: "FACULTY_APPROVED" }),
    Application.countDocuments({ ...filter, status: "FACULTY_REJECTED" }),
  ]);

  res.status(200).json(
    new ApiResponse("Faculty dashboard stats fetched", {
      assignedApplications: assigned,
      pendingReviews: pending,
      approvedReviews: approved,
      rejectedReviews: rejected,
    })
  );
});
