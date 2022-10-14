export default function Header() {
  return (
    <header class="bg-yellow-400 flex items-center">
      <a href="/">
        <img
          src="/logo.png"
          alt="the fresh logo: a sliced lemon dripping with juice"
          class="h-20 p-2"
        />
      </a>
      <h1 class="text-xl pl-2">Docker Compose Management</h1>
    </header>
  );
}
