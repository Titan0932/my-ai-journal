import { applyParams, save, ActionOptions } from "gadget-server";

 
export const run: ActionRun = async ({ params, record, session, logger, api, connections }) => {
  applyParams(params, record);

  if (!record.date) {
    record.date = new Date().toISOString().split('T')[0];
  }

  if (session?.get("user")) {
    record.user = { _link: session.get("user") };
  }

  await save(record);
};

export const options: ActionOptions = {
  actionType: "create",
};
