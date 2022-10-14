import { JSX } from "preact";

export default function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <div>
      <button
        {...props}
        class="bg-yellow-400 hover:bg-yellow-300 text-white font-bold py-2 px-4 rounded"
      />
    </div>
  );
}
