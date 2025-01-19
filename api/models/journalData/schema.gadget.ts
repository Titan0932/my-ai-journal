import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "journalData" model, go to https://my-ai-journ.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "PQKB-5Z0gafu",
  fields: {
    content: {
      type: "string",
      validations: { required: true },
      storageKey: "WPG7UsG3JuBb",
    },
    date: {
      type: "dateTime",
      includeTime: false,
      validations: { required: true, unique: true },
      storageKey: "omLsYad4zAUC",
    },
    image: { type: "string", storageKey: "8KSnjOqbioEa" },
    keywords: { type: "json", storageKey: "GDpiY7E7m4cz" },
    moodscores: {
      type: "json",
      default: {},
      storageKey: "wtpbVFR7Khj3",
    },
    summary: { type: "string", storageKey: "jLSTlUvD5ZBI" },
    title: {
      type: "string",
      validations: { required: true },
      storageKey: "gkI2li4we1Tf",
    },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "LqLd-wLJ8PxT",
    },
  },
};
