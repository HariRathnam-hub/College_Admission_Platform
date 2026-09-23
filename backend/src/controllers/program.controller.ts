import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Program } from "../models/Program.model";
import { recordAudit } from "../utils/audit";
import { UpdateProgramInput } from "../validations/admin.validation";

export const listPrograms = asyncHandler(async (req: Request, res: Response) => {
  const { department, degreeLevel, search } = req.query as Record<string, string | undefined>;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const filter: Record<string, unknown> = { isActive: true };
  if (department) filter.department = department;
  if (degreeLevel) filter.degreeLevel = degreeLevel;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  const [programs, total] = await Promise.all([
    Program.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Program.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse("Programs fetched", {
      programs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

export const getProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw ApiError.notFound("Program not found");
  res.status(200).json(new ApiResponse("Program fetched", program));
});

export const listAllProgramsForAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const programs = await Program.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse("Programs fetched", programs));
});

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, availableSeats: req.body.totalSeats };
  const existing = await Program.findOne({ code: payload.code });
  if (existing) throw ApiError.conflict("A program with this code already exists");
  const program = await Program.create(payload);

  await recordAudit({ req, action: "PROGRAM_CREATED", targetType: "Program", targetId: program._id, meta: { code: program.code } });

  res.status(201).json(new ApiResponse("Program created", program));
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateProgramInput;
  const program = await Program.findById(req.params.id);
  if (!program) throw ApiError.notFound("Program not found");

  Object.assign(program, body);
  await program.save();

  await recordAudit({ req, action: "PROGRAM_UPDATED", targetType: "Program", targetId: program._id, meta: body });

  res.status(200).json(new ApiResponse("Program updated", program));
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw ApiError.notFound("Program not found");

  program.isActive = false;
  await program.save();

  await recordAudit({ req, action: "PROGRAM_DEACTIVATED", targetType: "Program", targetId: program._id });

  res.status(200).json(new ApiResponse("Program deactivated", program));
});
