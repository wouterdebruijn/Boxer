import { PageProps } from "$fresh/server.ts";
import Header from "../../components/Header.tsx";
import { ProjectContainer } from "../../controllers/ContainerController.ts";
import ProjectDetails from "../../islands/ProjectDetails.tsx";

export default function Project(
  { params }: PageProps<ProjectContainer[]>,
) {
  return (
    <div>
      <Header />
      <ProjectDetails project={params.project} />
    </div>
  );
}
