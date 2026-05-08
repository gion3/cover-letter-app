import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ICoverLetterParameters {
  tone: 'formal' | 'friendly' | 'enthusiastic'
  length: 'short' | 'medium' | 'long'
  language: 'English' | 'Romanian'
  emphasis: 'skills' | 'experience' | 'motivation'
}

export interface ICoverLetter extends Document {
  userId: Types.ObjectId
  cvId: Types.ObjectId
  jobDescription: string
  parameters: ICoverLetterParameters
  generatedText: string
  createdAt: Date
}

const CoverLetterSchema = new Schema<ICoverLetter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cvId: { type: Schema.Types.ObjectId, ref: 'CV', required: true },
    jobDescription: { type: String, required: true },
    parameters: {
      tone: { type: String, enum: ['formal', 'friendly', 'enthusiastic'], required: true },
      length: { type: String, enum: ['short', 'medium', 'long'], required: true },
      language: { type: String, enum: ['English', 'Romanian'], required: true },
      emphasis: { type: String, enum: ['skills', 'experience', 'motivation'], required: true },
    },
    generatedText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

const CoverLetter: Model<ICoverLetter> =
  mongoose.models.CoverLetter || mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema)

export default CoverLetter
