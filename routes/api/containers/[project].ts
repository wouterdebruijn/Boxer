import { Handlers } from "$fresh/server.ts";
import {
  ContainerController,
  ProjectContainer,
} from "../../../controllers/ContainerController.ts";

export const handler: Handlers<ProjectContainer[] | null> = {
  async GET(_, ctx) {
    const containers = await ContainerController.get(ctx.params.project);
    return new Response(JSON.stringify(containers));
  },
};
