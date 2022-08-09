/** @jsx h */
import { h } from "preact";
import { PageProps } from "$fresh/server.ts";
import Header from "../../components/Header.tsx";
import { DockerContainer } from "../api/containers/[project].ts";
import ProjectDetails from "../../islands/ProjectDetails.tsx";

export default function Project(
  { params }: PageProps<DockerContainer[]>,
) {
  return (
    <div>
      <Header />
      <ProjectDetails project={params.project} />
    </div>
  );
}
