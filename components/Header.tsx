/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function Header() {
  return (
    <header class={tw`bg-yellow-400 flex items-center`}>
      <a href="/">
        <img
          src="/logo.png"
          alt="the fresh logo: a sliced lemon dripping with juice"
          class={tw`h-20 p-2`}
        />
      </a>
      <h1 class={tw`text-xl pl-2`}>Docker Compose Management</h1>
    </header>
  );
}
