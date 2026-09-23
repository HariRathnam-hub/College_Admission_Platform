/**
 * Seed script: engineering programs commonly offered by Tamil Nadu engineering colleges.
 *
 * Usage:
 *   npm run seed:programs
 *
 * Behavior:
 *   - Connects to MongoDB using the same config as the running app (config/env, config/db).
 *   - Upserts each program by its unique `code` field, so re-running this script is safe
 *     and will never create duplicates (matches the unique index on Program.code).
 *   - Uses a single bulkWrite call (one round trip) instead of N individual inserts.
 *   - Existing programs are left untouched (only inserted if missing), so any admin edits
 *     made through the app after seeding are never clobbered by re-running this script.
 *   - Logs a clear summary and exits with status 0 on success, 1 on failure.
 */
import { connectDB, disconnectDB } from "../config/db";
import { Program, IProgram } from "../models/Program.model";
import { logger } from "../utils/logger";

type SeedProgram = Pick<
  IProgram,
  | "name"
  | "code"
  | "department"
  | "degreeLevel"
  | "description"
  | "durationYears"
  | "totalSeats"
  | "availableSeats"
  | "eligibilityCriteria"
  | "tuitionFee"
  | "applicationOpenDate"
  | "applicationDeadline"
  | "isActive"
>;

const STANDARD_ELIGIBILITY =
  "Pass in HSC (10+2) or equivalent with Physics, Chemistry and Mathematics as core subjects, " +
  "securing a minimum aggregate of 50% marks (45% for reserved categories). Admission through " +
  "TNEA (Tamil Nadu Engineering Admissions) counselling based on Class 12 cutoff marks.";

const AGRICULTURE_ELIGIBILITY =
  "Pass in HSC (10+2) or equivalent with Physics, Chemistry and Mathematics/Biology as core " +
  "subjects, securing a minimum aggregate of 50% marks (45% for reserved categories). Admission " +
  "through TNEA counselling based on Class 12 cutoff marks.";

const CSBS_ELIGIBILITY =
  "Pass in HSC (10+2) or equivalent with Mathematics, Physics, and Chemistry/Computer Science, " +
  "securing a minimum aggregate of 50% marks (45% for reserved categories). Admission through " +
  "TNEA counselling based on Class 12 cutoff marks.";

// Application window for the seeded catalog: open now, closing later this year.
const APPLICATION_OPEN_DATE = new Date("2026-05-01T00:00:00.000Z");
const APPLICATION_CLOSE_DATE = new Date("2026-10-31T23:59:59.000Z");

const DURATION_YEARS = 4; // All programs below are 4-year B.E./B.Tech undergraduate programs.

const PROGRAMS: SeedProgram[] = [
  {
    name: "Computer Science and Engineering",
    code: "CSE",
    department: "Computer Science and Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Comprehensive curriculum covering programming, data structures, algorithms, operating " +
      "systems, databases, and software engineering, preparing graduates for careers in software " +
      "development, systems engineering, and research.",
    durationYears: DURATION_YEARS,
    totalSeats: 120,
    availableSeats: 120,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 95000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Information Technology",
    code: "IT",
    department: "Information Technology",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Focuses on network administration, web technologies, information systems, and enterprise " +
      "software, building skills for IT infrastructure and application development roles.",
    durationYears: DURATION_YEARS,
    totalSeats: 120,
    availableSeats: 120,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 90000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Electronics and Communication Engineering",
    code: "ECE",
    department: "Electronics and Communication Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers analog and digital electronics, communication systems, signal processing, and " +
      "embedded systems, preparing graduates for careers in telecom, semiconductor, and " +
      "electronics industries.",
    durationYears: DURATION_YEARS,
    totalSeats: 120,
    availableSeats: 120,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 80000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Electrical and Electronics Engineering",
    code: "EEE",
    department: "Electrical and Electronics Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers power systems, electrical machines, control systems, and power electronics, " +
      "preparing students for roles in power generation, transmission, and industrial automation.",
    durationYears: DURATION_YEARS,
    totalSeats: 90,
    availableSeats: 90,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 75000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Mechanical Engineering",
    code: "MECH",
    department: "Mechanical Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers thermodynamics, manufacturing processes, machine design, and CAD/CAM, preparing " +
      "graduates for careers in automotive, manufacturing, and energy sectors.",
    durationYears: DURATION_YEARS,
    totalSeats: 120,
    availableSeats: 120,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 70000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Civil Engineering",
    code: "CIVIL",
    department: "Civil Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers structural engineering, geotechnical engineering, transportation, and construction " +
      "management, preparing graduates for careers in infrastructure development.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 65000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Artificial Intelligence and Data Science",
    code: "AIDS",
    department: "Artificial Intelligence and Data Science",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Combines artificial intelligence, machine learning, and data analytics with strong " +
      "programming foundations, preparing graduates for data-driven decision making and " +
      "intelligent systems development.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 95000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Artificial Intelligence and Machine Learning",
    code: "AIML",
    department: "Artificial Intelligence and Machine Learning",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Focuses on machine learning algorithms, neural networks, computer vision, and natural " +
      "language processing, preparing graduates for AI research and applied ML engineering roles.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 95000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Cyber Security",
    code: "CYS",
    department: "Cyber Security",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers network security, cryptography, ethical hacking, and digital forensics, preparing " +
      "graduates to protect systems and data against evolving cyber threats.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 85000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Computer Science and Business Systems",
    code: "CSBS",
    department: "Computer Science and Business Systems",
    degreeLevel: "UNDERGRADUATE",
    description:
      "An industry-curated program blending computer science fundamentals with business and " +
      "management concepts, preparing graduates for IT-enabled business and consulting roles.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: CSBS_ELIGIBILITY,
    tuitionFee: 92000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Robotics and Automation",
    code: "RAE",
    department: "Robotics and Automation",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers robotics, industrial automation, control systems, and mechatronics principles, " +
      "preparing graduates for careers in smart manufacturing and automated systems.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 78000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Mechatronics Engineering",
    code: "MCT",
    department: "Mechatronics Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "An interdisciplinary program combining mechanical, electronics, and computer engineering " +
      "to design smart, automated systems and integrated products.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 78000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Biomedical Engineering",
    code: "BME",
    department: "Biomedical Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Applies engineering principles to medicine and biology, covering medical instrumentation, " +
      "imaging systems, and biomaterials, preparing graduates for careers in healthcare technology.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 72000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Agricultural Engineering",
    code: "AGE",
    department: "Agricultural Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers farm machinery, irrigation engineering, food processing, and precision agriculture, " +
      "preparing graduates for careers in agricultural technology and rural development.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: AGRICULTURE_ELIGIBILITY,
    tuitionFee: 60000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Biotechnology",
    code: "BT",
    department: "Biotechnology",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers genetic engineering, bioprocess technology, and molecular biology, preparing " +
      "graduates for careers in pharmaceuticals, healthcare, and biotech research.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: AGRICULTURE_ELIGIBILITY,
    tuitionFee: 68000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Data Science",
    code: "DS",
    department: "Data Science",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Focuses on statistical analysis, big data technologies, and predictive modeling, " +
      "preparing graduates for careers as data analysts, data engineers, and data scientists.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 90000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Software Engineering",
    code: "SE",
    department: "Software Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Emphasizes software design principles, architecture, testing, and DevOps practices for " +
      "building scalable, reliable software systems.",
    durationYears: DURATION_YEARS,
    totalSeats: 60,
    availableSeats: 60,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 88000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Electronics Engineering (VLSI Design)",
    code: "VLSI",
    department: "Electronics Engineering (VLSI Design)",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Specializes in chip design, semiconductor devices, and VLSI architecture, preparing " +
      "graduates for careers in the semiconductor and chip design industry.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 82000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Computer and Communication Engineering",
    code: "CCE",
    department: "Computer and Communication Engineering",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Blends computer engineering with communication systems, covering networking, embedded " +
      "systems, and wireless communication technologies.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 84000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
  {
    name: "Internet of Things",
    code: "IOT",
    department: "Internet of Things",
    degreeLevel: "UNDERGRADUATE",
    description:
      "Covers sensor networks, embedded systems, cloud integration, and edge computing, " +
      "preparing graduates to design and deploy connected smart devices and systems.",
    durationYears: DURATION_YEARS,
    totalSeats: 30,
    availableSeats: 30,
    eligibilityCriteria: STANDARD_ELIGIBILITY,
    tuitionFee: 86000,
    applicationOpenDate: APPLICATION_OPEN_DATE,
    applicationDeadline: APPLICATION_CLOSE_DATE,
    isActive: true,
  },
];

async function seed() {
  logger.info(`Seeding ${PROGRAMS.length} programs...`);

  // One bulk round-trip. Each program is upserted by its unique `code`.
  // $setOnInsert means: only write the fields when the document does not
  // already exist — an existing program (and any admin edits made to it
  // afterwards, e.g. seat counts) is left completely untouched.
  const operations = PROGRAMS.map((program) => ({
    updateOne: {
      filter: { code: program.code.toUpperCase() },
      update: { $setOnInsert: program },
      upsert: true,
    },
  }));

  const result = await Program.bulkWrite(operations, { ordered: false });

  const insertedCount = result.upsertedCount ?? 0;
  const skippedCount = PROGRAMS.length - insertedCount;

  logger.info(`Seed complete: ${insertedCount} inserted, ${skippedCount} already existed (skipped).`);

  if (insertedCount > 0) {
    const insertedCodes = Object.values(result.upsertedIds ?? {});
    logger.info(`Inserted document ids: ${insertedCodes.join(", ")}`);
  }
}

async function main() {
  try {
    await connectDB();
    await seed();
    logger.info("Program seeding finished successfully.");
    process.exitCode = 0;
  } catch (error) {
    logger.error(`Program seeding failed: ${(error as Error).message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit(process.exitCode ?? 0);
  }
}

main();
