import modelData from "./pfi-model.v28.json";
import { pfiModelSchema, type PfiModel } from "./schema";

export const pfiModel: PfiModel = pfiModelSchema.parse(modelData);

export const pfiQuestions = pfiModel.dimensions.flatMap(
  (dimension) => dimension.questions,
);
