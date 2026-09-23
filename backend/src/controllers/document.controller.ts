import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { DocumentFile } from "../models/DocumentFile.model";
import { Application } from "../models/Application.model";
import { storeFile, deleteFile } from "../utils/fileStorage";

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const { type, applicationId } = req.body as { type: string; applicationId?: string };

  if (applicationId) {
    const application = await Application.findById(applicationId);
    if (!application) throw ApiError.notFound("Application not found");
    if (application.student.toString() !== req.user!.userId) throw ApiError.forbidden();
    if (application.status !== "DRAFT") {
      throw ApiError.badRequest("Documents can only be added while the application is in draft");
    }
  }

  const stored = await storeFile(req.file.buffer, req.file.originalname, req.user!.userId);

  const document = await DocumentFile.create({
    owner: req.user!.userId,
    application: applicationId || undefined,
    type,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    storageProvider: stored.provider,
    url: stored.url,
    publicId: stored.publicId,
  });

  if (applicationId) {
    await Application.findByIdAndUpdate(applicationId, { $addToSet: { documents: document._id } });
  }

  res.status(201).json(new ApiResponse("Document uploaded", document));
});

export const replaceDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const existing = await DocumentFile.findById(req.params.id);
  if (!existing) throw ApiError.notFound("Document not found");
  if (existing.owner.toString() !== req.user!.userId) throw ApiError.forbidden();

  const stored = await storeFile(req.file.buffer, req.file.originalname, req.user!.userId);

  await deleteFile({ provider: existing.storageProvider, publicId: existing.publicId, url: existing.url });

  existing.originalName = req.file.originalname;
  existing.mimeType = req.file.mimetype;
  existing.sizeBytes = req.file.size;
  existing.storageProvider = stored.provider;
  existing.url = stored.url;
  existing.publicId = stored.publicId;
  existing.status = "PENDING";
  existing.rejectionReason = undefined;
  existing.remarks = undefined;
  existing.verifiedBy = undefined;
  existing.verificationDate = undefined;
  await existing.save();

  res.status(200).json(new ApiResponse("Document replaced", existing));
});

export const listMyDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.query as { applicationId?: string };
  const filter: Record<string, unknown> = { owner: req.user!.userId };
  if (applicationId) filter.application = applicationId;

  const documents = await DocumentFile.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse("Documents fetched", documents));
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await DocumentFile.findById(req.params.id);
  if (!document) throw ApiError.notFound("Document not found");

  const isOwner = document.owner.toString() === req.user!.userId;
  const isStaff = req.user!.role === "FACULTY" || req.user!.role === "ADMIN";
  if (!isOwner && !isStaff) throw ApiError.forbidden();

  res.status(200).json(new ApiResponse("Document fetched", document));
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await DocumentFile.findById(req.params.id);
  if (!document) throw ApiError.notFound("Document not found");
  if (document.owner.toString() !== req.user!.userId) throw ApiError.forbidden();

  await deleteFile({ provider: document.storageProvider, publicId: document.publicId, url: document.url });
  if (document.application) {
    await Application.findByIdAndUpdate(document.application, { $pull: { documents: document._id } });
  }
  await document.deleteOne();

  res.status(200).json(new ApiResponse("Document deleted"));
});
