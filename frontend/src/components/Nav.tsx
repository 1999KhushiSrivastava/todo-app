const links = [
  { href: "/", label: "Home", id: "home" },
  { href: "/todos.html", label: "All tasks", id: "todos" },
];

export function Nav({ active }: { active?: "home" | "todos" | "add" }) {
  return (
    <nav className="nav" aria-label="Main">
      <a className="nav-brand" href="/">Todo</a>
      <div className="nav-links">
        {links.map((l) => (
          <a key={l.id} href={l.href} aria-current={active === l.id ? "page" : undefined}>{l.label}</a>
        ))}
      </div>
      <a className="btn btn-primary btn-sm" href="/add.html" aria-current={active === "add" ? "page" : undefined}>Add task</a>
    </nav>
  );
}
