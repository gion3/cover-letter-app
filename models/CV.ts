import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ICV extends Document {
  userId: Types.ObjectId
  filename: string
  extractedText: string
  uploadedAt: Date
}

const CVSchema = new Schema<ICV>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    extractedText: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

const CV: Model<ICV> = mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema)

export default CV
