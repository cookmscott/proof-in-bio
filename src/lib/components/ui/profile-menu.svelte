<script>
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar/index.js";
import { onMount } from "svelte";

// Simulated auth state - replace with real auth later
let isLoggedIn = true;
let user = {
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: "https://i.pravatar.cc/40?u=john"
};

// Dark mode state
let darkMode = false;

onMount(() => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    darkMode = true;
  } else if (saved === "light") {
    darkMode = false;
  } else {
    darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
});

function toggleDarkMode() {
  darkMode = !darkMode;
  if (darkMode) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}
</script>

<div class="fixed top-4 right-4 z-50">
  {#if isLoggedIn}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <button {...props} class="rounded-full">
            <Avatar class="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-56" align="end">
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            Profile
            <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            Settings
            <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            Keyboard shortcuts
            <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>Team</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
              <DropdownMenu.Item>Message</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>More...</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Item>
            New Team
            <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>GitHub</DropdownMenu.Item>
        <DropdownMenu.Item>Support</DropdownMenu.Item>
        <DropdownMenu.Item disabled>API</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <span class="flex items-center justify-between w-full">
            <span>Dark mode</span>
            <label class="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} on:change={toggleDarkMode} class="form-checkbox accent-primary" />
              <span class="ml-2 text-xs">{darkMode ? "On" : "Off"}</span>
            </label>
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          Log out
          <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {:else}
    <Button variant="outline">Login</Button>
  {/if}
</div>
