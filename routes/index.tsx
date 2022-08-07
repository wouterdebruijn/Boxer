/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  return (
    <div>
      <div class={tw`h-20 bg-yellow-400 flex items-center`}>
        <img
          src="/logo.png"
          alt="the fresh logo: a sliced lemon dripping with juice"
          class={tw`h-full p-1`}
        />
        <h1 class={tw`text-xl pl-2`}>Docker Compose Management</h1>
      </div>

      <p>
        Welcome to boxer, a tool for managing docker-compose files.
      </p>
    </div>
  );
}
