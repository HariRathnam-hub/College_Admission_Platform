import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/User.model";
import { StudentProfile } from "../models/StudentProfile.model";
import { FacultyProfile } from "../models/FacultyProfile.model";
import { Program } from "../models/Program.model";
import { Application, APPLICATION_STATUSES, ApplicationStatus, ADMIN_SETTABLE_STATUSES } from "../models/Application.model";
import { DocumentFile } from "../models/DocumentFile.model";
import { Notification } from "../models/Notification.model";
import { notify } from "../utils/notify";
import { recordAudit } from "../utils/audit";
import {
  UpdateUserInput,
  BroadcastNotificationInput,
  CreateStaffUserInput,
  AssignFacultyInput,
  AdminChangeStatusInput,
} from "../validations/admin.validation";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse("Users fetched", {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw ApiError.notFound("User not found");

  let profile = null;
  if (user.role === "STUDENT") {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === "FACULTY") {
    profile = await FacultyProfile.findOne({ user: user._id });
  }

  res.status(200).json(new ApiResponse("User fetched", { user, profile }));
});

export const createStaffUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department, designation, employeeId } = req.body as CreateStaffUserInput;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({ name, email, password, role });

  if (role === "FACULTY") {
    await FacultyProfile.create({ user: user._id, department, designation, employeeId });
  }

  await recordAudit({
    req,
    action: "USER_CREATED",
    targetType: "User",
    targetId: user._id,
    meta: { role: user.role, email: user.email },
  });

  res.status(201).json(
    new ApiResponse("Staff account created", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateUserInput;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");

  if (user._id.toString() === req.user!.userId && body.role && body.role !== user.role) {
    throw ApiError.badRequest("You cannot change your own role");
  }
  if (user._id.toString() === req.user!.userId && body.isActive === false) {
    throw ApiError.badRequest("You cannot deactivate your own account");
  }

  const before = { role: user.role, isActive: user.isActive };

  if (body.role !== undefined) {
    user.role = body.role;
    user.tokenVersion += 1; // force re-login on role change
  }
  if (body.isActive !== undefined) {
    user.isActive = body.isActive;
    if (!body.isActive) user.tokenVersion += 1; // force logout on deactivation
  }
  if (body.name !== undefined) user.name = body.name;

  await user.save();

  await recordAudit({
    req,
    action: body.isActive === false ? "USER_DEACTIVATED" : body.isActive === true ? "USER_ACTIVATED" : "USER_UPDATED",
    targetType: "User",
    targetId: user._id,
    meta: { before, after: { role: user.role, isActive: user.isActive } },
  });

  res.status(200).json(
    new ApiResponse("User updated", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    })
  );
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    usersByRole,
    totalPrograms,
    activePrograms,
    totalApplications,
    applicationsByStatus,
    totalStudentProfiles,
    totalFacultyProfiles,
    seatStats,
    totalDocuments,
    documentsByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Program.countDocuments(),
    Program.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    StudentProfile.countDocuments(),
    FacultyProfile.countDocuments(),
    Program.aggregate([
      {
        $group: {
          _id: null,
          totalSeats: { $sum: "$totalSeats" },
          availableSeats: { $sum: "$availableSeats" },
        },
      },
    ]),
    DocumentFile.countDocuments(),
    DocumentFile.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const statusCounts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<string, number>;
  applicationsByStatus.forEach((row: { _id: string; count: number }) => {
    statusCounts[row._id] = row.count;
  });

  const roleCounts = { STUDENT: 0, FACULTY: 0, ADMIN: 0 } as Record<string, number>;
  usersByRole.forEach((row: { _id: string; count: number }) => {
    roleCounts[row._id] = row.count;
  });

  const documentStatusCounts = { PENDING: 0, VERIFIED: 0, REJECTED: 0 } as Record<string, number>;
  documentsByStatus.forEach((row: { _id: string; count: number }) => {
    documentStatusCounts[row._id] = row.count;
  });

  const approved = statusCounts.ADMIN_APPROVED + statusCounts.ADMISSION_CONFIRMED;
  const rejected = statusCounts.FACULTY_REJECTED + statusCounts.ADMIN_REJECTED;
  const pending =
    statusCounts.SUBMITTED + statusCounts.UNDER_REVIEW + statusCounts.DOCUMENTS_PENDING + statusCounts.FACULTY_APPROVED;

  res.status(200).json(
    new ApiResponse("Analytics fetched", {
      users: {
        total: totalUsers,
        byRole: roleCounts,
        studentProfiles: totalStudentProfiles,
        facultyProfiles: totalFacultyProfiles,
      },
      programs: { total: totalPrograms, active: activePrograms, seats: seatStats[0] ?? { totalSeats: 0, availableSeats: 0 } },
      applications: { total: totalApplications, byStatus: statusCounts, approved, rejected, pending },
      documents: { total: totalDocuments, byStatus: documentStatusCounts },
    })
  );
});

export const broadcastNotification = asyncHandler(async (req: Request, res: Response) => {
  const { title, message, targetRole, studentId } = req.body as BroadcastNotificationInput;

  let recipients: { _id: unknown }[];
  if (targetRole === "SPECIFIC_STUDENT") {
    const student = await User.findOne({ _id: studentId, role: "STUDENT" }).select("_id");
    if (!student) throw ApiError.notFound("Student not found");
    recipients = [student];
  } else {
    const filter = targetRole === "ALL" ? {} : { role: targetRole };
    recipients = await User.find(filter).select("_id");
  }

  if (recipients.length === 0) {
    throw ApiError.badRequest("No matching recipients found");
  }

  await Notification.insertMany(
    recipients.map((recipient) => ({
      recipient: recipient._id,
      type: "GENERAL",
      title,
      message,
    }))
  );

  await recordAudit({
    req,
    action: "NOTIFICATION_BROADCAST",
    targetType: "Notification",
    meta: { targetRole, studentId, recipientCount: recipients.length, title },
  });

  res.status(201).json(new ApiResponse("Notification broadcast sent", { recipientCount: recipients.length }));
});

// ---- Application management (Admin) ----

export const listAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const { status, program, assignedFaculty, search } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (program) filter.program = program;
  if (assignedFaculty === "unassigned") filter.assignedFaculty = { $exists: false };
  else if (assignedFaculty) filter.assignedFaculty = assignedFaculty;

  let query = Application.find(filter)
    .populate("student", "name email")
    .populate("program", "name code department")
    .populate("assignedFaculty", "name email")
    .sort({ updatedAt: -1 });

  if (search) {
    const all = await query;
    const term = search.toLowerCase();
    const filtered = all.filter((app) => {
      const student = app.student as unknown as { name: string; email: string };
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

export const assignFacultyToApplication = asyncHandler(async (req: Request, res: Response) => {
  const { facultyId } = req.body as AssignFacultyInput;

  const faculty = await User.findOne({ _id: facultyId, role: "FACULTY" });
  if (!faculty) throw ApiError.notFound("Faculty member not found");

  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound("Application not found");

  application.assignedFaculty = faculty._id;
  await application.save();

  await recordAudit({
    req,
    action: "APPLICATION_ASSIGNED",
    targetType: "Application",
    targetId: application._id,
    meta: { facultyId },
  });

  res.status(200).json(new ApiResponse("Application assigned", application));
});

export const adminChangeApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body as AdminChangeStatusInput;

  const application = await Application.findById(req.params.id).populate("program", "name");
  if (!application) throw ApiError.notFound("Application not found");
  if (application.status === "DRAFT") {
    throw ApiError.badRequest("Draft applications have not been submitted yet");
  }
  if (!ADMIN_SETTABLE_STATUSES.includes(status as ApplicationStatus)) {
    throw ApiError.badRequest("Invalid status transition");
  }

  const previousStatus = application.status;
  application.status = status as ApplicationStatus;
  application.reviewedBy = req.user!.userId as any;
  application.statusHistory.push({
    status: status as ApplicationStatus,
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

// ---- Document verification (Admin) ----

export const listAllDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { status, applicationId } = req.query as Record<string, string | undefined>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (applicationId) filter.application = applicationId;

  const documents = await DocumentFile.find(filter)
    .populate("owner", "name email")
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json(new ApiResponse("Documents fetched", documents));
});
