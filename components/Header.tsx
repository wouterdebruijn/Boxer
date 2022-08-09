/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function Header() {
  return (
    <div class={tw`h-20 bg-yellow-400 flex items-center`}>
      <img
        src="/logo.png"
        alt="the fresh logo: a sliced lemon dripping with juice"
        class={tw`h-full p-1`}
      />
      <h1 class={tw`text-xl pl-2`}>Docker Compose Management</h1>
    </div>
  );
}
