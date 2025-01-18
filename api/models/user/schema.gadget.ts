import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://my-ai-journ.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "Fug8ETpII_lS",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "iqTA7h0DWqdl",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "f8yLGYkTZTKl",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "ehI06BisIcuH",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "U6EcDtz_hJ7W",
    },
    firstName: { type: "string", storageKey: "qJZFEoNKEK6Y" },
    googleImageUrl: { type: "url", storageKey: "AraEIplYxZvm" },
    googleProfileId: { type: "string", storageKey: "p-_cvLIFb_x9" },
    lastName: { type: "string", storageKey: "pdbrvA0iL1kg" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "0IRtT-FSEzHV",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "MRMfdtsdJ7Py",
    },
    profilePicture: {
      type: "file",
      allowPublicAccess: true,
      storageKey: "7wTvChSAiOUY",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "GMFqZyS3Tz7Q",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "2fe7ylk_nH6w",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "xMa15saMuPLT",
    },
  },
};
