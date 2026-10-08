import { processPaymentReminders } from "../public/_worker.js";
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processPaymentReminders(env));
  },
  fetch() {
    return new Response("Scheduled reminders only.", { status: 404 });
  },
};
