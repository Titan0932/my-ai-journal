import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "invite" model, go to https://my-ai-journ.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-internal-tool-invite",
  fields: {
    email: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "HQ6w230KV1Vl",
    },
    inviteToken: { type: "string", storageKey: "mOZh6zHKfyeG" },
  },
};
