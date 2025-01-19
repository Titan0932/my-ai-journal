import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, session, logger, api, connections }) => {
  applyParams(params, record);

 
  if (session?.get("user")) {
    record.user = { _link: session.get("user") };
  }

  await save(record)
};

export const options: ActionOptions = {
  actionType: "update",
};
