/** @jsx h */
import { h } from "preact";
import { PageProps } from "$fresh/server.ts";
import { Header } from "../../components/Header.tsx";
import { tw } from "../../utils/twind.ts";

export default function Greet(props: PageProps) {
  return (
    <div>
    <Header />

    <h1 class={tw`mt-7 ml-6 text-lg`}>{props.params.name}:</h1>
    <div class={tw`flex flex-wrap mx-3`}>
    </div>
  </div>
  )
}
