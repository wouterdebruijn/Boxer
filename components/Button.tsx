/** @jsx h */
import { h } from "preact";
import { tw } from "../utils/twind.ts";

export default function Button(props: h.JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <div>
      <button
        {...props}
        class={tw`bg-yellow-400 hover:bg-yellow-300 text-white font-bold py-2 px-4 rounded`}
      />
    </div>
  );
}
