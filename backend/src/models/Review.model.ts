import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export const REVIEW_RECOMMENDATIONS = ["RECOMMEND_APPROVE", "RECOMMEND_REJECT"] as const;
export type ReviewRecommendation = (typeof REVIEW_RECOMMENDATIONS)[number];

export interface IReview extends MongooseDocument {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  reviewer: Types.ObjectId;
  recommendation: ReviewRecommendation;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recommendation: { type: String, enum: REVIEW_RECOMMENDATIONS, required: true },
    comments: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

reviewSchema.index({ application: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });

export const Review = model<IReview>("Review", reviewSchema);
