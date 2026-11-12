import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true },
    height: { type: Number, required: true }, 
    weight: { type: Number, required: true }, 
    bmi: { type: Number }, 
    school: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    birthday: { type: Date, required: true },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;