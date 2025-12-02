import mongoose from "mongoose";

const Schema = mongoose.Schema;


const regleOccurrenceSchema = new Schema({
    frequence: { type: String, required: true },
    intervale: { type: String, required: false },
    date_fin: { type: Date, required: false },
});

export const RegleOccurrenceModel = mongoose.model("RegleOccurrence", regleOccurrenceSchema);

export async function creerRegleOccurrence(frequence, date_fin) {
    const regleOccurrence = new RegleOccurrenceModel({
        frequence: frequence,
        date_fin: date_fin,
    });

    await regleOccurrence.save();
    return regleOccurrence;
}